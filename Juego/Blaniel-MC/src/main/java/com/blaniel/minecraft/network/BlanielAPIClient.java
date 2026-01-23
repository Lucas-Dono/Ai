package com.blaniel.minecraft.network;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import okhttp3.*;

import java.io.IOException;
import java.util.concurrent.CompletableFuture;

/**
 * Cliente HTTP para comunicarse con la API de Blaniel
 */
public class BlanielAPIClient {

	private static final Gson GSON = new Gson();
	private static final OkHttpClient CLIENT = new OkHttpClient();
	private static final MediaType JSON = MediaType.parse("application/json; charset=utf-8");

	private final String baseUrl;
	private final String jwtToken;

	public BlanielAPIClient(String baseUrl, String jwtToken) {
		this.baseUrl = baseUrl;
		this.jwtToken = jwtToken;
	}

	/**
	 * Login con email y password
	 * Endpoint: POST /api/auth/minecraft-login
	 */
	public static CompletableFuture<LoginResponse> login(String baseUrl, String email, String password) {
		return CompletableFuture.supplyAsync(() -> {
			try {
				// Construir body
				JsonObject body = new JsonObject();
				body.addProperty("email", email);
				body.addProperty("password", password);

				// Construir request
				RequestBody requestBody = RequestBody.create(body.toString(), JSON);
				Request request = new Request.Builder()
					.url(baseUrl + "/api/auth/minecraft-login")
					.addHeader("Content-Type", "application/json")
					.post(requestBody)
					.build();

				// Ejecutar request
				try (Response response = CLIENT.newCall(request).execute()) {
					String responseBody = response.body().string();

					if (!response.isSuccessful()) {
						LoginResponse errorResponse = new LoginResponse();
						errorResponse.success = false;
						errorResponse.error = parseErrorMessage(responseBody);
						return errorResponse;
					}

					LoginResponse loginResponse = GSON.fromJson(responseBody, LoginResponse.class);
					loginResponse.success = true;
					return loginResponse;
				}

			} catch (Exception e) {
				System.err.println("[Blaniel API] Login error: " + e.getMessage());
				e.printStackTrace();

				LoginResponse errorResponse = new LoginResponse();
				errorResponse.success = false;
				errorResponse.error = "Error de conexión: " + e.getMessage();
				return errorResponse;
			}
		});
	}

	private static String parseErrorMessage(String responseBody) {
		try {
			JsonObject json = GSON.fromJson(responseBody, JsonObject.class);
			if (json.has("error")) {
				return json.get("error").getAsString();
			}
		} catch (Exception e) {
			// Ignore parsing errors
		}
		return "Error desconocido";
	}

	/**
	 * Enviar mensaje al agente
	 * Endpoint: POST /api/v1/minecraft/agents/{id}/chat
	 */
	public CompletableFuture<ChatResponse> sendMessage(String agentId, String message, MinecraftContext context) {
		return CompletableFuture.supplyAsync(() -> {
			try {
				// Construir body
				JsonObject body = new JsonObject();
				body.addProperty("message", message);

				JsonObject contextObj = new JsonObject();
				if (context != null) {
					contextObj.addProperty("activity", context.activity);
					contextObj.addProperty("timeOfDay", context.timeOfDay);
					contextObj.addProperty("weather", context.weather);

					if (context.position != null) {
						JsonObject pos = new JsonObject();
						pos.addProperty("x", context.position.x);
						pos.addProperty("y", context.position.y);
						pos.addProperty("z", context.position.z);
						pos.addProperty("world", context.position.world);
						contextObj.add("position", pos);
					}
				}
				body.add("context", contextObj);

				// Construir request
				RequestBody requestBody = RequestBody.create(body.toString(), JSON);
				Request request = new Request.Builder()
					.url(baseUrl + "/api/v1/minecraft/agents/" + agentId + "/chat")
					.addHeader("Authorization", "Bearer " + jwtToken)
					.addHeader("Content-Type", "application/json")
					.post(requestBody)
					.build();

				// Ejecutar request
				try (Response response = CLIENT.newCall(request).execute()) {
					if (!response.isSuccessful()) {
						throw new IOException("HTTP " + response.code() + ": " + response.message());
					}

					String responseBody = response.body().string();
					return GSON.fromJson(responseBody, ChatResponse.class);
				}

			} catch (Exception e) {
				System.err.println("[Blaniel API] Error: " + e.getMessage());
				e.printStackTrace();

				// Fallback response
				ChatResponse fallback = new ChatResponse();
				fallback.response = "Lo siento, no puedo conectarme al servidor ahora.";
				fallback.emotions = new EmotionData();
				fallback.emotions.primary = "neutral";
				fallback.emotions.intensity = 0.5;
				fallback.emotions.animation = "idle";
				return fallback;
			}
		});
	}

	/**
	 * Obtener lista de agentes disponibles
	 * Endpoint: GET /api/v1/minecraft/agents
	 */
	public CompletableFuture<AgentListResponse> getAvailableAgents() {
		return CompletableFuture.supplyAsync(() -> {
			try {
				Request request = new Request.Builder()
					.url(baseUrl + "/api/v1/minecraft/agents")
					.addHeader("Authorization", "Bearer " + jwtToken)
					.get()
					.build();

				try (Response response = CLIENT.newCall(request).execute()) {
					if (!response.isSuccessful()) {
						throw new IOException("HTTP " + response.code() + ": " + response.message());
					}

					String responseBody = response.body().string();
					return GSON.fromJson(responseBody, AgentListResponse.class);
				}

			} catch (Exception e) {
				System.err.println("[Blaniel API] Error: " + e.getMessage());
				e.printStackTrace();
				return null;
			}
		});
	}

	// ===== Data Classes =====

	public static class ChatResponse {
		public String response;
		public EmotionData emotions;
		public ActionData action;
		public RelationshipData relationship;
	}

	public static class EmotionData {
		public String primary;
		public double intensity;
		public String animation;
	}

	public static class ActionData {
		public String type;
	}

	public static class RelationshipData {
		public String stage;
		public double trust;
		public double affinity;
	}

	public static class AgentListResponse {
		public AgentData[] agents;
		public int total;
		public String plan;
	}

	public static class AgentData {
		public String id;
		public String name;
		public String gender;
		public int age;
		public String profession;
		public String currentEmotion;
	}

	public static class MinecraftContext {
		public String activity;
		public int timeOfDay;
		public String weather;
		public Position position;
	}

	public static class Position {
		public double x;
		public double y;
		public double z;
		public String world;
	}

	public static class LoginResponse {
		public boolean success;
		public String error;
		public String token;
		public int expiresIn;
		public UserDataResponse user;
		public AgentData[] agents;
		public String message;
	}

	public static class UserDataResponse {
		public String id;
		public String email;
		public String name;
		public String image;
		public String plan;
	}
}
