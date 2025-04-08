import yaml from "js-yaml";
import express from "express";
import { Logger } from "../entities/logger";
import { ERRORS } from "../constant/errors";
import { StoreModel } from "../schemas/store/store";
import * as dotenv from "dotenv";

dotenv.config();

const TRAEFIK_HOST = process.env.TRAEFIK_HOST;
const TRAEFIK_KEY = process.env.TRAEFIK_KEY;
const CLIENT_DOMAIN = process.env.CLIENT_DOMAIN; 

export const traefik_config = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const auth_header = req.headers["x-traefik-token"];

    if (!auth_header || auth_header !== TRAEFIK_KEY) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const stores = await StoreModel.find({
      is_active: true,
      $or: [{ domain: { $ne: null } }, { custom_domain: { $ne: null } }],
    }).lean();

    const traefikConfig: Record<string, any> = {
      http: {
        routers: {},
        services: {
          // "backend-api": {
          //   loadBalancer: {
          //     servers: [{ url: "http://store-ns8c00oksckw04k8scso0kcs:8080" }],
          //   },
          // },
          "frontend-service": {
            loadBalancer: {
              servers: [{ url: TRAEFIK_HOST }],
            },
          },
        },
      },
    };

    stores.forEach((store) => {
      let domain: string | null = null;

      if (store.custom_domain) {
        domain = store.custom_domain.replace(/^https?:\/\//, ""); // Remove http:// or https://
      } else if (store.domain) {
        domain = `${store.domain}.${CLIENT_DOMAIN}`;
      }

      if (domain) {
        const routerName = domain.replace(/\./g, "-");

        traefikConfig.http.routers[routerName] = {
          rule: `Host(\`${domain}\`)`,
          service: "frontend-service",
          entryPoints: ["https"],
          tls: {
            certResolver: "letsencrypt",
          },
        };
      }
    });

    const yamlConfig = yaml.dump(traefikConfig);
    res.set("Content-Type", "text/yaml");
    return res.status(200).send(yamlConfig).end();
  } catch (error) {
    Logger.error(error);
    return res.status(500).send({ message: error.message || "Server Error" });
  }
};

export const health = async (req: express.Request, res: express.Response) => {
  try {
    return res.status(200).json({ status: 200, success: true }).end();
  } catch (error) {
    Logger.error(error);
    return res.status(500).send({ message: error.message || ERRORS.SERVER });
  }
};
