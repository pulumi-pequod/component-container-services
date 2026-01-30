# component-aws-container-services

Abstraction for resources needed when using AWS container services. 

This repo delivers a set of components to abstract the details related to:
- Creating a docker image and pushing it to AWS ECR.
- Deploy ECS using the docker image. 
- Do both the image build and deployment as a single component.

# Usage
## Specify Package in `Pulumi.yaml`

Add the following to your `Pulumi.yaml` file:
Note: If no version is specified, the latest version will be used.

```
packages:
  container-services: https://github.com/pulumi-pequod/component-container-services[@vX.Y.Z]
``` 

## Use SDK in Program

### Python
```
from pulumi_pequod_container_services import AppImageDeploy, AppImageDeployArgs

app_deployment = AppImageDeploy(f"app-image", AppImageArgs(  
  docker_file_path="./app"
))
```

### Typescript
```
import { AppImageDeploy } from "@pulumi-pequod/container-services";

const appDeployment = new AppImageDeploy(baseName, {dockerFilePath: "./app"})
```

### Dotnet
```
using PulumiPequod.ContainerServices;

var appDeployment = new AppImageDeploy("stack-settings", { DockerFilePath: "./app" });
```

### YAML
```
  appImageDeploy:
    type: container-services:AppImageDeploy
    properties:
      dockerFilePath: ./app
```




