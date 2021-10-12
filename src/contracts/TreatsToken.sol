pragma solidity >=0.7.0 <0.9.0;
// SPDX-License-Identifier: MIT
import "./../../../openzeppelin-contracts/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";

contract TreatsToken is ERC20PresetMinterPauser {
    constructor() ERC20PresetMinterPauser("TreatsToken", "TRT") {}
}
