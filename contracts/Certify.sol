// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Certify {

    address public admin;

    constructor() {
        admin = msg.sender;
    }

    struct Certificate {
        string id;
        string studentName;
        string course;
        string issueDate;
        string issuer;
        bool valid;
    }

    mapping(string => Certificate) private certs;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized");
        _;
    }

    // Issue Certificate
    function issueCert(
        string memory _id,
        string memory _studentName,
        string memory _course,
        string memory _issueDate,
        string memory _issuer
    ) public onlyAdmin {

        certs[_id] = Certificate(
            _id,
            _studentName,
            _course,
            _issueDate,
            _issuer,
            true
        );
    }

    // Verify Certificate
    function verifyCert(string memory _id)
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            string memory,
            bool
        )
    {
        Certificate memory c = certs[_id];
        return (
            c.studentName,
            c.course,
            c.issueDate,
            c.issuer,
            c.valid
        );
    }

    // Check
    function isValid(string memory _id) public view returns (bool) {
        return certs[_id].valid;
    }
}