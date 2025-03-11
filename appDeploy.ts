import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

export interface AppDeployArgs {
    imageReference: pulumi.Input<string>;
    cpu?: number;
    memory?: number;
    accessCidr?: string;
}

// Build a docker image and push it to a registry
export class AppDeploy extends pulumi.ComponentResource {
    // Return some output tbd
    public readonly loadbalancerDnsName: pulumi.Output<string>;

    constructor(name: string, args: AppDeployArgs, opts?: pulumi.ComponentResourceOptions) {
        super("container-services:index:AppDeploy", name, args, opts);

        // Using default VPC for now. 
        // May add support for custom VPC in the future.
        const vpc = new awsx.ec2.DefaultVpc(`defaultVpc`, {}, { parent: this })

        // Security group for the LB
        const lbSecurityGroup = new aws.ec2.SecurityGroup(`${name}-lb-sg`, {
            vpcId: vpc.vpcId,
            ingress: [{ protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: [args.accessCidr || "0.0.0.0/0"] }],
            egress: [{ protocol: "tcp", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] }],
        }, { parent: this });

        // An ALB to serve the container endpoint to the internet.
        const loadbalancer = new awsx.lb.ApplicationLoadBalancer(`${name}-lb`, {
            securityGroups: [lbSecurityGroup.id],
        }, { parent: this });

        // ECS cluster
        const cluster = new aws.ecs.Cluster(`${name}-ecs`, {}, { parent: this });

        // Security group for ECS service that accepts traffic from the lb security group
        const ecsSecurityGroup = new aws.ec2.SecurityGroup(`${name}-ecs-sg`, {
            vpcId: vpc.vpcId,
            ingress: [{ protocol: "tcp", fromPort: 80, toPort: 80, securityGroups: [lbSecurityGroup.id] }],
            egress: [{ protocol: "tcp", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] }],
        }, { parent: this });

        // Deploy an ECS Service on Fargate to host the application container.
        const service = new awsx.ecs.FargateService(`${name}-service`, {
            cluster: cluster.arn,
            // assignPublicIp: true,
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
            networkConfiguration: {
                subnets: vpc.privateSubnetIds,
                securityGroups: [ecsSecurityGroup.id],
            },

        }, { parent: this });

        // The URL at which the container's HTTP endpoint will be available.
        this.loadbalancerDnsName = loadbalancer.loadBalancer.dnsName

        this.registerOutputs({});

    }
}