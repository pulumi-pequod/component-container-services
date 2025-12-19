import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

export interface AppDeployArgs {
    /** 
     * The registry reference for the image to deploy. 
     **/
    imageReference: pulumi.Input<string>;
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

// Build a docker image and push it to a registry
export class AppDeploy extends pulumi.ComponentResource {
    /**
     *  The URL at which the container's HTTP endpoint will be available.
     **/
    public readonly loadbalancerDnsName: pulumi.Output<string>;

    constructor(name: string, args: AppDeployArgs, opts?: pulumi.ComponentResourceOptions) {
        super("container-services:index:AppDeploy", name, args, opts);

        // Set Owner and Environment tags 
        const tags = {
            "Owner": `${pulumi.getProject()}-${pulumi.getStack()}`,
            "Environment": pulumi.getStack()
        }

        // An ALB to serve the container endpoint to the internet.
        const loadbalancer = new awsx.lb.ApplicationLoadBalancer(`${name}-lb`, {tags: tags}, { parent: this });

        // ECS cluster
        const cluster = new aws.ecs.Cluster(`${name}-ecs`, {tags: tags}, { parent: this });

        // Deploy an ECS Service on Fargate to host the application container.
        const service = new awsx.ecs.FargateService(`${name}-service`, {
            cluster: cluster.arn,
            assignPublicIp: true,
            taskDefinitionArgs: {
                container: {
                    name: `${name}-container`,
                    image: args.imageReference,
                    cpu: args.cpu || 256, // Default to 0.25 vCPU
                    memory: args.memory || 512, // Default to 0.5 GB
                    essential: true,
                    portMappings: [{
                        containerPort: 80,
                        targetGroup: loadbalancer.defaultTargetGroup,
                    }],
                },
            },
            tags: tags,
        }, { parent: this });

        this.loadbalancerDnsName = loadbalancer.loadBalancer.dnsName

        this.registerOutputs({});

    }
}