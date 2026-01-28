// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {CovenantBase} from "./lib/CovenantBase.sol";

contract CovenantTemplateRegistry is CovenantBase {
    struct Template {
        address author;
        bytes32 parentTemplateId;
        string metadataURI;
        uint96 royaltyBps;
        bool active;
    }

    mapping(bytes32 => Template) public templates;

    event TemplatePublished(bytes32 indexed templateId, address indexed author, string metadataURI, uint96 royaltyBps);

    constructor(address initialOwner) CovenantBase(initialOwner) {}

    function publishTemplate(
        bytes32 templateId,
        bytes32 parentTemplateId,
        string calldata metadataURI,
        uint96 royaltyBps
    ) external whenNotPaused {
        templates[templateId] = Template({
            author: msg.sender,
            parentTemplateId: parentTemplateId,
            metadataURI: metadataURI,
            royaltyBps: royaltyBps,
            active: true
        });

        emit TemplatePublished(templateId, msg.sender, metadataURI, royaltyBps);
    }

    function setTemplateActive(bytes32 templateId, bool active) external onlyOwner {
        templates[templateId].active = active;
    }
}
