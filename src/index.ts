import 'reflect-metadata';
import Container, { Service } from 'typedi';
import { PrismaClient } from '@prisma/client';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fileUpload from 'express-fileupload';
import { graphqlHTTP } from 'express-graphql';
import { buildSchemaSync } from "type-graphql";
import { resolvers } from "@generated/type-graphql";

@Service()
export default class Main {
  constructor() {
    const prisma = new PrismaClient();
    const port = process.env.PORT || 4000;
    const app = express();
    app.use(fileUpload({
      createParentPath: true,
      limits: {
        fileSize: 50 * 1024 * 1024 * 1024 // 50MB max file size
      },
    }));
    //add other middleware
    app.use(cors());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(morgan('dev'));

    const schema = buildSchemaSync({
      resolvers,
      validate: false,
    });
    app.use("/graphql", graphqlHTTP({
      schema: schema,
      graphiql: true,
      context: { prisma: prisma },
    }));

    app.listen(port, () => {
      console.log(`App is listening on port ${port}.`)
    });
  }
}


Container.get(Main);