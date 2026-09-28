import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SIM Peternakan API",
      version: "1.0.0",
      description:
        "Dokumentasi REST API Sistem Informasi Manajemen Peternakan Ayam Petelur",
    },

    servers: [
      {
        url: process.env.APP_URL || "http://localhost:5000",
        description: "Development Server",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },

      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Terjadi kesalahan.",
            },
            errors: {
              type: "array",
              nullable: true,
              items: {
                type: "object",
              },
            },
          },
        },

        SuccessResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Berhasil.",
            },
            data: {
              type: "object",
              nullable: true,
            },
          },
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerUi, swaggerSpec };
