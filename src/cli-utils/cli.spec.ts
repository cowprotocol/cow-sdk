import { exec } from 'child_process'

const pk = '0x54574aba486dbad0c4d3e7fced10cfa35331c51a4968a5e381723e5f43b819a2'

describe('Cow SDK CLI', () => {
  it('Sign order', (done) => {
    exec(
      `
    yarn run run-cli --silent -- \\
      --private-key="${pk}" \\
      --chainId=5 \\
      --operation=signOrder \\
      --kind=sell \\
      --partiallyFillable=false \\
      --expiresIn=600 \\
      --sellToken="0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6" \\
      --buyToken="0x91056D4A53E1faa1A84306D4deAEc71085394bC8" \\
      --sellAmount="90000000000000000" \\
      --buyAmount="539761635000000000000" \\
      --feeAmount="0" \\
      --receiver=""
  `,
      (err, stdOut) => {
        const order = JSON.parse(stdOut.trim())

        delete order.validTo
        delete order.signature
        expect(order).toMatchSnapshot()
        done()
      }
    )
  }, 10_000)

  it('Send order', (done) => {
    exec(
      `
    yarn run run-cli --silent -- \\
      --private-key="${pk}" \\
      --chainId=5 \\
      --operation=sendOrder \\
      --kind=sell \\
      --partiallyFillable=false \\
      --expiresIn=600 \\
      --sellToken="0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6" \\
      --buyToken="0x91056D4A53E1faa1A84306D4deAEc71085394bC8" \\
      --sellAmount="90000000000000000" \\
      --buyAmount="539761635000000000000" \\
      --feeAmount="0" \\
      --receiver=""
  `,
      (err, stdOut) => {
        expect(stdOut.trim()).toBe('The account needs to approve the selling token in order to trade')
        done()
      }
    )
  }, 10_000)

  it('Cancel order', (done) => {
    exec(
      `
    yarn run run-cli --silent -- \\
      --private-key="${pk}" \\
      --chainId=5 \\
      --operation=cancelOrder \\
      --orderUid="0xe0759f514e5e0a5d3e0ae7b492de87d72d765a94c4a6d16c5301a02c91cfaa44fb3c7eb936caa12b5a884d612393969a557d430763be64a2"
  `,
      (err, stdOut) => {
        expect(stdOut.trim()).toBe('The order you are trying to cancel does not exist')
        done()
      }
    )
  }, 10_000)

  it('Get order', (done) => {
    exec(
      `
    yarn run run-cli --silent -- \\
      --chainId=5 \\
      --operation=getOrder \\
      --orderUid="0xf499f5d64bbc49b744f03418ac70d4f2e02d71e235e64eaf51488741d2c2cffcd02de8da0b71e1b59489794f423fabba2adc4d93ffffffff"
  `,
      (err, stdOut) => {
        expect(stdOut.trim()).toMatchSnapshot()
        done()
      }
    )
  }, 10_000)

  it('Get orders', (done) => {
    exec(
      `
    yarn run run-cli --silent -- \\
      --chainId=5 \\
      --operation=getOrders \\
      --limit=2 \\
      --offset=0 \\
      --owner="0xfb3c7eb936caa12b5a884d612393969a557d4307"
  `,
      (err, stdOut) => {
        expect(stdOut.trim()).toMatchSnapshot()
        done()
      }
    )
  }, 10_000)
})
