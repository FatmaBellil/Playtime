import Boom from "@hapi/boom";
import { IdSpec, PlaylistArraySpec, PlaylistSpec, PlaylistSpecPlus } from "../models/joi-schemas.js";
import { db } from "../models/db.js";
import { validationError } from "./logger.js";

export const playlistApi = {
  find: {
    auth: { // This is because these endpoints are now expecting valid tokens.
      strategy: "jwt",
    },

    handler: async function (request, h) {
      try {
        const playlists = await db.playlistStore.getAllPlaylists();
        return playlists;
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Get all playlistApi",
    notes: "Returns details of all playlistApi",
    response: {schema: PlaylistArraySpec, failAction: validationError }
  },

  findOne: {
    auth: {
      strategy: "jwt",
    },

    async handler(request) {
      try {
        const playlist = await db.playlistStore.getPlaylistById(request.params.id);
        if (!playlist) {
          return Boom.notFound("No Playlist with this id");
        }
        return playlist;
      } catch (err) {
        return Boom.serverUnavailable("No Playlist with this id");
      }
    },
    tags: ["api"],
    description: "Get a specefic playlist",
    notes: "Returns playlist details",
    validate:{params: {id: IdSpec}, failAction: validationError},
    response: {schema: PlaylistSpecPlus, failAction: validationError }
  },

  create: {
    auth: {
      strategy: "jwt",
    },

    handler: async function (request, h) {
      try {
        const playlist = request.payload;
        const newPlaylist = await db.playlistStore.addPlaylist(playlist);
        if (newPlaylist) {
          return h.response(newPlaylist).code(201);
        }
        return Boom.badImplementation("error creating playlist");
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Create a playlist",
    notes: "Returns the newly created playlist",
    validate: { payload: PlaylistSpec, failAction: validationError },
    response: { schema: PlaylistSpecPlus, failAction: validationError },
  },

  deleteOne: {
    auth: {
      strategy: "jwt",
    },

    handler: async function (request, h) {
      try {
        const playlist = await db.playlistStore.getPlaylistById(request.params.id);
        if (!playlist) {
          return Boom.notFound("No Playlist with this id");
        }
        await db.playlistStore.deletePlaylistById(playlist._id);
        return h.response().code(204);
      } catch (err) {
        return Boom.serverUnavailable("No Playlist with this id");
      }
    },
    tags: ["api"],
    description: "Delete a specific playlist",
    notes: "a specific playlist removed from Playtime",
    validate: { params: { id: IdSpec }, failAction: validationError },
  },

  deleteAll: {
    auth: {
      strategy: "jwt",
    },

    handler: async function (request, h) {
      try {
        await db.playlistStore.deleteAllPlaylists();
        return h.response().code(204);
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Delete all playlistApi",
    notes: "All playlistApi removed from Playtime",
  },
};
