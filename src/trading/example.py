from subprocess import check_output
import json

args = [
'--action=getQuote',
'--chainId=11155111',
'--signer=574ed8a3c3baf4ed2c2fe5225a3bee6999b6a5ab735d297aca9dfc6c3f540000',
'--appCode="UtilsCliExample"',
'--orderKind="sell"',
'--sellToken="0x0625afb445c3b6b7b929342a04a22599fd5dbb59"',
'--sellTokenDecimals=18',
'--buyToken="0xbe72e441bf55620febc26715db68d3494213d8cb"',
'--buyTokenDecimals=6',
'--amount=12222000000000000000000',
'--env="prod"',
'--partiallyFillable=false',
'--slippageBps=0',
'--receiver=""',
'--validFor=300',
'--partnerFeeBps=0',
'--partnerFeeRecipient=""'
]

# after `npm install @cowprotocol/cow-sdk`
# rawResult = check_output(['npx', 'cow-sdk-trading-cli'] + args)

rawResult = check_output(['yarn', 'run', '--silent', 'trading-cli'] + args)
result = json.loads(rawResult)

print('orderToSign:', result['orderToSign'])
print('amountsAndCosts:', result['amountsAndCosts'])
print('quoteResponse:', result['quoteResponse'])
