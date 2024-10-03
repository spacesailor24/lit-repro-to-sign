## Reproduction Steps:

1. `yarn`
2. `cp .env.example .env`
   - Fill in the `ETHEREUM_PRIVATE_KEY` with your private key that holds Lit test tokens on Yellowstone
3. `yarn test`

If `swallowError` is set to `true`, the test will fail with the following error:

```
[Lit-JS-SDK v6.8.0] [2024-10-03T03:47:32.637Z] [DEBUG] [core] [id: b7696d1ef1e83] handleNodePromises res: {
  success: false,
  error: {
    success: false,
    error: 'Uncaught (in promise) RangeError: toSign must not be empty\n' +
      '    at Object.signEcdsa (ext:lit_actions/02_litActionsSDK.js:142:14)\n' +
      '    at <user_provided_script>:3:20\n' +
      '    at <user_provided_script>:15:7',
    logs: ''
  }
}
```

If `swallowError` is set to `false`, the test will fail with the actual error:

```
[Lit-JS-SDK v6.8.0] [2024-10-03T03:47:04.459Z] [DEBUG] [core] [id: 1b416f7280b17] handleNodePromises res: {
  success: false,
  error: {
    success: false,
    error: 'Uncaught (in promise) Error: You can not sign without providing an auth_sig. You must create a session with the PKP, and then pass session sigs in, which will be converted to an auth sig per node. Refer the the docs on creating and using session sigs.\n' +
      '    at Object.signEcdsa (ext:lit_actions/02_litActionsSDK.js:142:14)\n' +
      '    at <user_provided_script>:9:20\n' +
      '    at <user_provided_script>:15:7',
    logs: ''
  }
}
```
