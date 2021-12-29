# CDK setup for GEOAxIS

Project setup:
```
cdk bootstrap aws://<account-id>/<region>
cd app
npm i
npm --prefix ./lambda i
cd ../../
npm i
npm run deploy
```

The `cdk.json` file tells the CDK Toolkit how to execute your app. The build step is not required when using JavaScript.

## Useful commands

 * `npm run test`         perform the jest unit tests
 * `cdk deploy`           deploy this stack to your default AWS account/region
 * `cdk diff`             compare deployed stack with current state
 * `cdk synth`            emits the synthesized CloudFormation template