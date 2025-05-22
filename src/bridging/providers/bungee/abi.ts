export const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
]

export const BUNGEE_COWSWAP_LIB_ABI = [
  'function replaceBytes(bytes memory _original, uint256 _start, uint256 _length, bytes memory _replacement) external pure returns (bytes memory)',
  // 'function addPctDiff(uint256 _base, bytes memory _compare, uint256 _target) public pure returns (uint256)', // unused for now
  // 'function subPctDiff(uint256 _base, bytes memory _compare, uint256 _target) public pure returns (uint256)', // unused for now
  'function applyPctDiff(uint256 _base, bytes memory _compare, uint256 _target) public pure returns (uint256)',
]

export const SOCKET_GATEWAY_ABI = [
  'function executeRoute(uint32 routeId, bytes calldata routeData) external payable returns (bytes memory)',
]
