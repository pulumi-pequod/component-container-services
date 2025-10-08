import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as dockerBuild from "@pulumi/docker-build";

export interface AppImageArgs{
    /**
     * The path to the directory containing the Dockerfile for the image to be built..
     **/
    dockerFilePath: string;
}

// Build a docker image and push it to a registry
export class AppImage extends pulumi.ComponentResource {
    /**
     * The URI of the repository that was created.
     **/
    public readonly repositoryPath: pulumi.Output<string>;
    /**
     * The image reference (URI) of the image that was built and pushed to the repository.
     **/
    public readonly imageRef: pulumi.Output<string>;

    constructor(name: string, args: AppImageArgs, opts?: pulumi.ComponentResourceOptions) {
        super("container-services:index:AppImage", name, args, opts);

        const dockerFilePath = args.dockerFilePath;

        // Set Owner tag 
        const tags = {"Owner": `${pulumi.getProject()}-${pulumi.getStack()}`}

        const kmsKey = new aws.kms.Key(`${name}-kms-key`, {
            description: "KMS key for encrypting ECR images",
            keyUsage: "ENCRYPT_DECRYPT",
            isEnabled: true,
            enableKeyRotation: true,
            deletionWindowInDays: 7,
            tags: tags,
        }, { parent: this });
        
        const ecr = new awsx.ecr.Repository(`${name}-ecr-repo`, {
            encryptionConfigurations: [{
                encryptionType: "KMS",
                kmsKey: kmsKey.arn,
            }],
            imageScanningConfiguration: {
                scanOnPush: true,
            },
            // MUTABLE (which is actually the default) since we are always just pushing the "latest" image.
            imageTagMutability: "MUTABLE",
            forceDelete: true,
            tags: tags,

        }, { parent: this });
        this.repositoryPath = ecr.repository.repositoryUrl;
        
        // Grab auth credentials for ECR.
        const auth = aws.ecr.getAuthorizationTokenOutput({
            registryId: ecr.repository.registryId,
        });
        
        const image = new dockerBuild.Image(`${name}-docker-image`, {
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
        }, { parent: this });

        this.imageRef = image.ref

        this.registerOutputs({});

    }
}