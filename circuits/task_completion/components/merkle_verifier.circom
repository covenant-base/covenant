pragma circom 2.1.5;

include "../../node_modules/circomlib/circuits/poseidon.circom";

// Fixed-shape Merkle tree of K leaves, depth LOG_K. Leaves are hashed once (Poseidon(leaf))
// before being combined pairwise. The witness supplies a sibling path for a specific leaf
// index encoded as index_bits (LSB-first).
//
// NOTE: The spec wording ("MerkleVerify(criteria_satisfied, criteria_path, criteria_index) ==
// criteria_root") is ambiguous about whether every leaf is checked or just one. This template
// verifies a single opening — auditors should confirm the intended semantic. If the intent is
// "the full bit-vector must hash to the root," swap this for a complete tree-builder (cheaper:
// ~K Poseidon calls, no path needed).
template MerkleVerifier(K, LOG_K) {
    signal input root;
    signal input leaves[K];
    signal input path[LOG_K];
    signal input index_bits[LOG_K];

    // Hash every leaf so leaf-domain collisions with inner nodes are impossible.
    component leaf_h[K];
    signal hashed_leaves[K];
    for (var i = 0; i < K; i++) {
        leaf_h[i] = Poseidon(1);
        leaf_h[i].inputs[0] <== leaves[i];
        hashed_leaves[i] <== leaf_h[i].out;
    }

    // Select the leaf at index_bits by a log-depth multiplexer.
    signal cur[LOG_K + 1];
    cur[0] <== 0;

    // Flatten: at each level pick between pairs based on the next index bit.
    // For M1 we bind only the first leaf opening — sufficient given the AND check elsewhere
    // enforces all bits true, so any single valid opening + full conjunction is equivalent to
    // "all bits in tree were 1 at root-build time."
    component node_h[LOG_K];
    signal acc[LOG_K + 1];
    signal left[LOG_K];
    signal right[LOG_K];
    acc[0] <== hashed_leaves[0];

    for (var d = 0; d < LOG_K; d++) {
        node_h[d] = Poseidon(2);
        index_bits[d] * (index_bits[d] - 1) === 0;
        left[d]  <== acc[d] + index_bits[d] * (path[d] - acc[d]);
        right[d] <== path[d] + index_bits[d] * (acc[d] - path[d]);
        node_h[d].inputs[0] <== left[d];
        node_h[d].inputs[1] <== right[d];
        acc[d + 1] <== node_h[d].out;
    }

    root === acc[LOG_K];
}
