// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {CovenantBase} from "./lib/CovenantBase.sol";

contract CovenantCapabilityRegistry is CovenantBase {
    struct Capability {
        string slug;
        string metadataURI;
        bool enabled;
    }

    mapping(uint16 => Capability) public capabilities;

    event CapabilityUpdated(uint16 indexed capabilityId, string slug, string metadataURI, bool enabled);

    constructor(address initialOwner) CovenantBase(initialOwner) {}

    function setCapability(
        uint16 capabilityId,
        string calldata slug,
        string calldata metadataURI,
        bool enabled
    ) external onlyOwner {
        capabilities[capabilityId] = Capability({
            slug: slug,
            metadataURI: metadataURI,
            enabled: enabled
        });

        emit CapabilityUpdated(capabilityId, slug, metadataURI, enabled);
    }
}
