// Abstracts dockerBuildPush and containerRun into a single component.
// It builds and pushes the docker image and then deploys it.

import * as pulumi from "@pulumi/pulumi";
import { AppImage, AppImageArgs } from "./appImage";
import { AppDeploy, AppDeployArgs } from "./appDeploy";

export interface AppImageDeployArgs {
    cpu?: number;
    memory?: number;
}

export class AppImageDeploy extends pulumi.ComponentResource {
    // Return some output tbd
    public readonly loadbalancerDnsName: pulumi.Output<string>;

    constructor(name: string, args: AppImageDeploy, opts?: pulumi.ComponentResourceOptions) {
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