import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as dockerBuild from "@pulumi/docker-build";

export interface ContainerRunArgs{
    imageReference: pulumi.Input<string>;
    cpu?: number;
    memory?: number;
    destination?: string; // indicates if the image is to be pushed to, say AWS ECR, or GCP, etc. Defaults to AWS ECR.
}

// Build a docker image and push it to a registry
export class ContainerRun extends pulumi.ComponentResource {
    // Return some output tbd
    public readonly loadbalancerDnsName: pulumi.Output<string>;

    constructor(name: string, args: ContainerRunArgs, opts?: pulumi.ComponentResourceOptions) {
        super("container-services:index:ContainerRun", name, args, opts);

        // An ALB to serve the container endpoint to the internet.
        const loadbalancer = new awsx.lb.ApplicationLoadBalancer(`${name}-lb`, {}, { parent: this });

        // ECS cluster
        const cluster = new aws.ecs.Cluster(`${name}-ecs`, {}, { parent: this });

        // Deploy an ECS Service on Fargate to host the application container.
        const service = new awsx.ecs.FargateService(`${name}-service`, {
            cluster: cluster.arn,
            assignPublicIp: true,
            taskDefinitionArgs: {
                container: {
                    name: `${name}-container`,
                    image: args.imageReference,
                    cpu: args.cpu || 256, // Default to 0.25 vCPU
                    memory: args.memory || 1024, // Default to 1GB
                    essential: true,
                    portMappings: [{
                        containerPort: 80,
                        targetGroup: loadbalancer.defaultTargetGroup,
                    }],
                },
            },
        }, { parent: this });

        // The URL at which the container's HTTP endpoint will be available.
        this.loadbalancerDnsName = loadbalancer.loadBalancer.dnsName

        this.registerOutputs({});

    }
}