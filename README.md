# component-container-services
Abstraction for resources needed when using container services. 

This repo delivers a set of components to abstract the details related to:
- Creating a docker image and pushing it to a repository.
- Deploy container service using the docker image. 
- Do both the image build and deployment as a single component.

This mitigates the cognitive load on the developer to get the infrastructure they need to run their application.

# Usage

In the folder of the project code that is using the component, run the following command using the release you want.
```bash
pulumi package add https://github.com/pulumi-pequod/component-container-services@v0.1.0
```

# Example Programs
There are two test projects provided that use the component:
- Typescript (`test-project-ts`) and 
- YAML (`test-project-yaml`)

To use:
* cd to the test project folder you want to use.
* `pulumi package add https://github.com/MitchellGerdisch/component-random-abstracted@v0.1.0`
* `pulumi stack init`
* Modify the program as you want.
* `pulumi up`
