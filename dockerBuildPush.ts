import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as dockerBuild from "@pulumi/docker-build";

export interface DockerBuildPushArgs{
    dockerFilePath: string;
    destination: string; // indicates if the image is to be pushed to, say AWS ECR, or GCP, etc. Defaults to AWS ECR.
}

// Build a docker image and push it to a registry
export class DockerBuildPush extends pulumi.ComponentResource {
    // Return some output tbd
    public readonly repositoryPath: pulumi.Output<string>;

    constructor(name: string, args: DockerBuildPushArgs, opts?: pulumi.ComponentResourceOptions) {
        super("docker-abstracted:index:DockerBuildPush", name, args, opts);

        const dockerFilePath = args.dockerFilePath;
        const destination = args.destination || "aws";

        if (destination === "aws") {
        
            const ecr = new awsx.ecr.Repository("repo", {
                forceDelete: true,
            });
            this.repositoryPath = ecr.repository.repositoryUrl;
            
            // Grab auth credentials for ECR.
            const auth = aws.ecr.getAuthorizationTokenOutput({
                registryId: ecr.repository.registryId,
            });

            const image = new dockerBuild.Image("image", {
                // Enable exec to run a custom docker-buildx binary with support
                // for Docker Build Cloud (DBC).
                exec: true,
                // Use the pushed image as a cache source.
                cacheFrom: [{
                    registry: {
                        ref: pulumi.interpolate`${this.repositoryPath}:cache`,
                    },
                }],
                cacheTo: [{
                    registry: {
                        imageManifest: true,
                        ociMediaTypes: true,
                        ref: pulumi.interpolate`${this.repositoryPath}:cache`,
                    },
                }],
                platforms: [
                    dockerBuild.Platform.Linux_amd64,
                    // add more as needed
                ],
                push: true,
                // Provide our ECR credentials.
                registries: [{
                    address: this.repositoryPath,
                    password: auth.password,
                    username: auth.userName,
                }],
                //
                // Other parameters
                //
                // Tag our image with our ECR repository's address.
                tags: [pulumi.interpolate`${this.repositoryPath}:latest`],
                // The Dockerfile resides in the app directory for this example.
                context: {
                    location: dockerFilePath,
                },
            });
        }

        this.registerOutputs({});
    }
}