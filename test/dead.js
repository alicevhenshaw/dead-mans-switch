/* eslint-env mocha */
/* global assert artifacts contract */

const Dead = artifacts.require('Dead.sol');
const Token = artifacts.require('./tokens/HumanStandardToken.sol');

const utils = require('./utils.js');
const BN = require('bignumber.js');

contract('Dead', (accounts) => {
  describe('Function: heartbeat', () => {
    const [owner, beneficiary] = accounts;

    it('should increment lastHeartbeat by heartbeatPeriod', async () => {
      const dead = await Dead.deployed();
      const heartbeatPeriod = await dead.heartbeatPeriod.call();
      const timeToHeartbeat = heartbeatPeriod.dividedToIntegerBy('2');

      const initialLastHeartbeat = await dead.lastHeartbeat.call();

      await utils.increaseTime(timeToHeartbeat.toNumber());
      await utils.as(owner, dead.heartbeat);

      const finalLastHeartbeat = await dead.lastHeartbeat.call();

      assert(finalLastHeartbeat.gte(initialLastHeartbeat.add(timeToHeartbeat.sub(new BN('10', 10)))),
        'lastHeartbeat was not incremented as-expected');
      assert(finalLastHeartbeat.lte(initialLastHeartbeat.add(timeToHeartbeat.add(new BN('10', 10)))),
        'lastHeartbeat was not incremented as-expected');
    });

    it('should not let a non-owner increment lastHeartbeat', async () => {
      const dead = await Dead.deployed();

      const initialLastHeartbeat = await dead.lastHeartbeat.call();

      try {
        await utils.as(beneficiary, dead.heartbeat);
      } catch (err) {
        assert(utils.isEVMException(err), err.toString());
      }

      const finalLastHeartbeat = await dead.lastHeartbeat.call();

      assert(finalLastHeartbeat.eq(initialLastHeartbeat),
        'A non-owner was able to increment lastHeartbeat');
    });
  });
});

contract('Dead', () => {
  describe('Function: depositEther', () => {
    it('should fire an event indicating the amount of ether deposited');
  });
});

contract('Dead', () => {
  describe('Function: withdrawEther', () => {
    it('should allow the owner to withdraw ether before lastPeriod + heartbeatPeriod');
    it('should not allow a beneficiary to withdraw ether before lastPeriod + heartbeatPeriod');
    it('should allow a beneficiary to withdraw ether after lastPeriod + heartbeatPeriod');
    it('should fire an event indicating the amount of ether withdrawn');
  });
});

contract('Dead', (accounts) => {
  describe('Function: depositERC20', () => {
    const [owner, tokenOwner] = accounts;

    it('should fire an event indicating the amount of tokens deposited ' +
       'and its address', async () => {
      const dead = await Dead.deployed();
      const token = await Token.deployed();

      const ownerInitialBalance = await token.balanceOf.call(owner);

      await utils.as(owner, token.transfer, tokenOwner, ownerInitialBalance);

      const tokenOwnerInitialBalance = await token.balanceOf.call(tokenOwner);

      const receipt = await utils.depositTokens(tokenOwner, tokenOwnerInitialBalance, dead.address);

      assert.strictEqual(utils.getReceiptValue(receipt, '_addr').toString(), token.address);
      assert.strictEqual(utils.getReceiptValue(receipt, '_amount').toString(), '1000');

      const tokenOwnerFinalBalance = await token.balanceOf.call(tokenOwner);
      assert(tokenOwnerFinalBalance.eq(new BN('0', 10)),
        'the token owner\'s balance was not properly decremented');

      const deadFinalBalance = await token.balanceOf.call(dead.address);
      assert(deadFinalBalance.eq(tokenOwnerInitialBalance),
        'the DMS\' final balance was not properly incremented');
    });
  });
});

contract('Dead', () => {
  describe('Function: withdrawERC20', () => {
    it('should allow the owner to withdraw tokens before lastPeriod + heartbeatPeriod');

    it('should not allow a beneficiary to withdraw tokens before lastPeriod + heartbeatPeriod');
    it('should allow a beneficiary to withdraw tokens after lastPeriod + heartbeatPeriod');
    it('should fire an event indicating the amount of tokens withdrawn, the token\'s ' +
       'symbol and its address');
  });
});
