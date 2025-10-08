// Abstracts dockerBuildPush and containerRun into a single component.
// It builds and pushes the docker image and then deploys it.

import * as pulumi from "@pulumi/pulumi";
import { AppImage, AppImageArgs } from "./appImage";
import { AppDeploy, AppDeployArgs } from "./appDeploy";

export interface AppImageDeployArgs {
    /**
     * The path to the directory containing the Dockerfile for the image to be built..
     **/
    dockerFilePath: string;
    /**
     * The number of CPU units to assign to the task.
     * E.g. 256 (.25 vCPU), 512 (.5 vCPU), 1024 (1 vCPU)
     **/
    cpu?: number;
    /**
     * The amount of memory (in MiB) to assign to the task.
     * E.g. 512 (0.5 GB), 1024 (1 GB), 2048 (2 GB)
     **/
    memory?: number;
}

export class AppImageDeploy extends pulumi.ComponentResource {
    /**
     *  The URL at which the container's HTTP endpoint will be available.
     **/    
    public readonly loadbalancerDnsName: pulumi.Output<string>;

    constructor(name: string, args: AppImageDeployArgs, opts?: pulumi.ComponentResourceOptions) {
        super("container-services:index:AppImageDeploy", name, args, opts);

        const dockerImage = new AppImage("dockerImage", {
            dockerFilePath: "./app",
        }, { parent: this });

        const service = new AppDeploy("container", {
            imageReference: dockerImage.imageRef,
        }, { parent: this });

        // The URL at which the container's HTTP endpoint will be available.
        this.loadbalancerDnsName = service.loadbalancerDnsName

        this.registerOutputs({});

    }
}