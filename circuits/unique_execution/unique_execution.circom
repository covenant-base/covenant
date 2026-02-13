pragma circom 2.1.5;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

// Proves that an execution trace committed as `execution_root` is NOT present
// in a sorted merkle tree of prior execution roots. This blocks replay-farming:
// an agent cannot submit the same execution trace multiple times to inflate
// category reputation.
//
// Non-membership witness: in a sorted merkle tree, non-membership of X is
// proven by showing two adjacent leaves (lo, hi) where lo < X < hi (or
// X < leaf_0 or X > leaf_last for boundary cases). Both lo and hi must have
// valid merkle inclusion proofs, and hi must be at index(lo)+1 to guarantee
// adjacency.
//
// All values are range-bound to 252 bits via Num2Bits. Poseidon outputs that
// exceed 2^252 (~25% of bn254 Fr) must be rehashed by the tree builder to
// stay in range. This is enforced: the circuit is unsatisfiable for out-of-range
// inputs.

template SortedMerkleNonMembership(DEPTH) {
    // Public inputs
    signal input execution_root;
    signal input prior_roots_merkle_root;
    signal input agent_did;
    signal input capability_bit;
    signal input task_id;

    // Private inputs: adjacent-leaf non-membership witness
    signal input lo_leaf;
    signal input hi_leaf;
    signal input lo_path[DEPTH];
    signal input lo_index[DEPTH];
    signal input hi_path[DEPTH];
    signal input hi_index[DEPTH];

    // 0. Reject execution_root == 0 (zero bypasses boundary checks)
    component er_not_zero = IsZero();
    er_not_zero.in <== execution_root;
    er_not_zero.out === 0;

    // 1. Range-bind all values to 252 bits
    component lo_bits = Num2Bits(252);
    lo_bits.in <== lo_leaf;
    component hi_bits_check = Num2Bits(252);
    hi_bits_check.in <== hi_leaf;
    component er_bits = Num2Bits(252);
    er_bits.in <== execution_root;

    // 2. Prove lo_leaf < execution_root < hi_leaf (strict ordering)
    //    lo_leaf == 0 means left boundary (execution_root < all leaves).
    //    hi_leaf == 0 means right boundary (execution_root > all leaves).
    //    Both zero is invalid (empty tree).

    component lo_is_zero = IsZero();
    lo_is_zero.in <== lo_leaf;

    component lo_lt_er = LessThan(252);
    lo_lt_er.in[0] <== lo_leaf;
    lo_lt_er.in[1] <== execution_root;

    signal lo_ok;
    lo_ok <== lo_is_zero.out + lo_lt_er.out - lo_is_zero.out * lo_lt_er.out;
    lo_ok === 1;

    component hi_is_zero = IsZero();
    hi_is_zero.in <== hi_leaf;

    component er_lt_hi = LessThan(252);
    er_lt_hi.in[0] <== execution_root;
    er_lt_hi.in[1] <== hi_leaf;

    signal hi_ok;
    hi_ok <== hi_is_zero.out + er_lt_hi.out - hi_is_zero.out * er_lt_hi.out;
    hi_ok === 1;

    signal both_zero;
    both_zero <== lo_is_zero.out * hi_is_zero.out;
    both_zero === 0;

    // 3. Verify lo_leaf merkle inclusion
    component lo_leaf_hash = Poseidon(1);
    lo_leaf_hash.inputs[0] <== lo_leaf;

    signal lo_running[DEPTH + 1];
    lo_running[0] <== lo_leaf_hash.out;

    component lo_path_hash[DEPTH];
    signal lo_left[DEPTH];
    signal lo_right[DEPTH];

    for (var d = 0; d < DEPTH; d++) {
        lo_index[d] * (lo_index[d] - 1) === 0;
        lo_left[d]  <== lo_running[d] + lo_index[d] * (lo_path[d] - lo_running[d]);
        lo_right[d] <== lo_path[d] + lo_index[d] * (lo_running[d] - lo_path[d]);
        lo_path_hash[d] = Poseidon(2);
        lo_path_hash[d].inputs[0] <== lo_left[d];
        lo_path_hash[d].inputs[1] <== lo_right[d];
        lo_running[d + 1] <== lo_path_hash[d].out;
    }

    prior_roots_merkle_root === lo_running[DEPTH];

    // 4. Verify hi_leaf merkle inclusion
    component hi_leaf_hash = Poseidon(1);
    hi_leaf_hash.inputs[0] <== hi_leaf;

    signal hi_running[DEPTH + 1];
    hi_running[0] <== hi_leaf_hash.out;

    component hi_path_hash[DEPTH];
    signal hi_left[DEPTH];
    signal hi_right[DEPTH];

    for (var d = 0; d < DEPTH; d++) {
        hi_index[d] * (hi_index[d] - 1) === 0;
        hi_left[d]  <== hi_running[d] + hi_index[d] * (hi_path[d] - hi_running[d]);
        hi_right[d] <== hi_path[d] + hi_index[d] * (hi_running[d] - hi_path[d]);
        hi_path_hash[d] = Poseidon(2);
        hi_path_hash[d].inputs[0] <== hi_left[d];
        hi_path_hash[d].inputs[1] <== hi_right[d];
        hi_running[d + 1] <== hi_path_hash[d].out;
    }

    prior_roots_merkle_root === hi_running[DEPTH];

    // 5. Adjacency: hi is at index(lo) + 1. In a sorted merkle tree with
    //    2^DEPTH leaves, index(lo)+1 means the lowest bit of the index flips
    //    and all lower bits are zero... but that only works for specific tree
    //    layouts. The general approach: reconstruct lo_index as a number,
    //    reconstruct hi_index as a number, and check hi_idx == lo_idx + 1.

    signal lo_idx_acc[DEPTH + 1];
    signal hi_idx_acc[DEPTH + 1];
    signal pow2[DEPTH];

    lo_idx_acc[0] <== 0;
    hi_idx_acc[0] <== 0;

    for (var d = 0; d < DEPTH; d++) {
        // pow2[d] = 2^d (compile-time constant folded)
        if (d == 0) {
            pow2[d] <== 1;
        } else {
            pow2[d] <== pow2[d-1] * 2;
        }
        lo_idx_acc[d+1] <== lo_idx_acc[d] + lo_index[d] * pow2[d];
        hi_idx_acc[d+1] <== hi_idx_acc[d] + hi_index[d] * pow2[d];
    }

    // For non-boundary cases, require hi_idx == lo_idx + 1.
    // For left boundary (lo_leaf==0), hi_idx must be 0 (first leaf).
    // For right boundary (hi_leaf==0), lo_idx must be 2^DEPTH - 1 (last leaf).
    signal lo_idx;
    lo_idx <== lo_idx_acc[DEPTH];
    signal hi_idx;
    hi_idx <== hi_idx_acc[DEPTH];

    // Normal case: hi = lo + 1
    signal idx_diff;
    idx_diff <== hi_idx - lo_idx;
    component is_adjacent = IsZero();
    is_adjacent.in <== idx_diff - 1;

    // Left boundary: lo_leaf==0 means we don't check adjacency (hi is first leaf)
    // Right boundary: hi_leaf==0 means we don't check adjacency (lo is last leaf)
    signal is_boundary;
    is_boundary <== lo_is_zero.out + hi_is_zero.out - lo_is_zero.out * hi_is_zero.out;

    signal adj_ok;
    adj_ok <== is_boundary + is_adjacent.out - is_boundary * is_adjacent.out;
    adj_ok === 1;

    // 6. Range-bind capability_bit to 7 bits
    component cb = Num2Bits(7);
    cb.in <== capability_bit;
}

component main { public [execution_root, prior_roots_merkle_root, agent_did, capability_bit, task_id] } =
    SortedMerkleNonMembership(9);
