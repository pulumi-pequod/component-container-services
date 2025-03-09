// Pulumi program to build with DBC and push a Docker image to a registry.

// Import required libraries, update package.json if you add more.
import * as aws from "@pulumi/aws"; // Required for ECS
import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi"; // Required for Config and interpolation

import { DockerBuildPush, DockerBuildPushArgs } from "../../dockerBuildPush";
import { ContainerRun, ContainerRunArgs} from "../../containerRun";

const config = new pulumi.Config();
const baseName = config.get("baseName") || pulumi.getProject();

// Use component to create docker image and push to AWS ECR
const dockerImage = new DockerBuildPush("dockerImage", {
    dockerFilePath: "./app",
    destination: "aws",
});
export const imageRepositoryPath = dockerImage.repositoryPath

const container = new ContainerRun("container", {
    imageReference: dockerImage.imageRef,
});

// The URL at which the container's HTTP endpoint will be available.
export const appUrl = pulumi.interpolate`http://${container.loadbalancerDnsName}`;
