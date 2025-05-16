import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

export interface AppDeployArgs {
    imageReference: pulumi.Input<string>;
    cpu?: number;
    memory?: number;
}

// Build a docker image and push it to a registry
export class AppDeploy extends pulumi.ComponentResource {
    // Return some output tbd
    public readonly loadbalancerDnsName: pulumi.Output<string>;

    constructor(name: string, args: AppDeployArgs, opts?: pulumi.ComponentResourceOptions) {
        super("container-services:index:AppDeploy", name, args, opts);

        // Set Owner tag 
        const tags = {"Owner": `${pulumi.getProject()}-${pulumi.getStack()}`}

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

        // The URL at which the container's HTTP endpoint will be available.
        this.loadbalancerDnsName = loadbalancer.loadBalancer.dnsName

        this.registerOutputs({});

    }
}