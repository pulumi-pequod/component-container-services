// Pulumi program to build with DBC and push a Docker image to a registry.

// Import required libraries, update package.json if you add more.
import * as aws from "@pulumi/aws"; // Required for ECS
import * as awsx from "@pulumi/awsx";
// import * as dockerBuild from "@pulumi/docker-build";
import * as pulumi from "@pulumi/pulumi"; // Required for Config and interpolation



// // An ECS cluster to deploy into.
// const cluster = new aws.ecs.Cluster("cluster", {});

// // An ALB to serve the container endpoint to the internet.
// const loadbalancer = new awsx.lb.ApplicationLoadBalancer("loadbalancer", {});

// // Deploy an ECS Service on Fargate to host the application container.
// const service = new awsx.ecs.FargateService("service", {
//     cluster: cluster.arn,
//     assignPublicIp: true,
//     taskDefinitionArgs: {
//         container: {
//             name: "service-container",
//             image: image.ref,
//             cpu: 128,
//             memory: 512,
//             essential: true,
//             portMappings: [{
//                 containerPort: 80,
//                 targetGroup: loadbalancer.defaultTargetGroup,
//             }],
//         },
//     },
// });

// // The URL at which the container's HTTP endpoint will be available.
// export const url = pulumi.interpolate`http://${loadbalancer.loadBalancer.dnsName}`;
