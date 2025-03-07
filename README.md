# component-docker-build
Abstraction for docker build and push to registry.

The idea is to deliver a component that takes as input:
- Path to docker file
- Simple input to drive where the docker image should be pushed (e.g. AWS ECR, GCP, etc)

So the developer using the component doesn't need to know any details about building and pushing the image.

# Usage

In the folder of the project code that is using the component, run the following command.
```bash
pulumi package add https://github.com/MitchellGerdisch/component-random-abstracted@v0.1.0
```

# Example Program
The `test-project` folder has an example Pulumi project that uses the component.

To use:
* copy the `test-project` to a local folder.
* cd to the test project folder.
* `pulumi package add https://github.com/MitchellGerdisch/component-random-abstracted@v0.1.0`
* `pulumi stack init`
* Modify the code to use one of the allowed sizes (i.e. `small`, `medium`, `large`, `xlarge`) 
* `pulumi up`
