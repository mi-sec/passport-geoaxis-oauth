# CDK setup for GEOAxIS

Steps for setup:

1. Register a OAuth consumer in [GEOAxIS PROD](https://portal.geoaxis.gs.mil/about/how-it-works/getting-started)
   or [GEOAxIS DEV](https://portal-tst.geoaxis.gs.mil/about/how-it-works/getting-started)
2. Copy the `.env.template` to `.env` and fill out appropriately

Project deployment:

```
cdk bootstrap aws://<account-id>/<region>
make deploy
```

The `cdk.json` file tells the CDK Toolkit how to execute your app. The build step is not required when using JavaScript.

## Useful commands

* `npm run test`         perform the jest unit tests
* `cdk deploy`           deploy this stack to your default AWS account/region
* `cdk diff`             compare deployed stack with current state
* `cdk synth`            emits the synthesized CloudFormation template
