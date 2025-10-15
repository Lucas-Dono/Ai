/**
 * FastSD CPU Local Client
 *
 * Cliente para generar imágenes usando FastSD CPU instalado localmente.
 * Soporta auto-detección, instalación asistida y modelos NSFW sin censura.
 *
 * Características:
 * - Detección automática de instalación FastSD
 * - API REST local (http://localhost:8000)
 * - Modelos SD 1.5 NSFW de Civitai
 * - Generación rápida con OpenVINO (0.8-2s)
 * - Sin límites de cuota ni costos
 */

import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface FastSDConfig {
  apiUrl?: string; // Default: http://localhost:8000
  installPath?: string; // Ruta de instalación personalizada
  autoStart?: boolean; // Iniciar FastSD automáticamente si no está corriendo
  useOpenVINO?: boolean; // Usar optimización OpenVINO
  model?: string; // Modelo a usar (default: SD 1.5)
}

export interface FastSDGenerationParams {
  prompt: string;
  negativePrompt?: string;
  width?: number; // 256, 512, 768, 1024
  height?: number;
  steps?: number; // 1-25
  guidanceScale?: number;
  seed?: number;
  useOpenVINO?: boolean;
  useTinyAutoencoder?: boolean; // TAESD para 1.4x speedup
}

export interface FastSDGenerationResult {
  imageBase64: string; // Imagen en base64
  seed: number;
  generationTime: number; // Tiempo en segundos
}

export interface FastSDSystemInfo {
  installed: boolean;
  running: boolean;
  version?: string;
  availableModels?: string[];
  device?: string; // CPU, GPU, NPU
  installPath?: string;
}

/**
 * Cliente para FastSD CPU local
 */
export class FastSDLocalClient {
  private apiUrl: string;
  private config: FastSDConfig;
  private installPath: string;

  constructor(config?: FastSDConfig) {
    this.config = config || {};
    this.apiUrl = config?.apiUrl || "http://localhost:8000";
    this.installPath = config?.installPath || this.getDefaultInstallPath();
  }

  /**
   * Obtiene la ruta de instalación por defecto según el sistema operativo
   */
  private getDefaultInstallPath(): string {
    const homeDir = process.env.HOME || process.env.USERPROFILE || "";
    return path.join(homeDir, "fastsdcpu");
  }

  /**
   * Verifica si FastSD está instalado
   */
  async isInstalled(): Promise<boolean> {
    try {
      // Verificar si existe el directorio de instalación
      if (!fs.existsSync(this.installPath)) {
        return false;
      }

      // Verificar archivos clave
      const keyFiles = ["src/app.py", "requirements.txt", "start-webserver.bat"];
      const hasKeyFiles = keyFiles.some((file) =>
        fs.existsSync(path.join(this.installPath, file))
      );

      return hasKeyFiles;
    } catch (error) {
      console.error("[FastSD] Error checking installation:", error);
      return false;
    }
  }

  /**
   * Verifica si el servidor FastSD está corriendo
   */
  async isRunning(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/info`, {
        timeout: 2000,
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtiene información del sistema FastSD
   */
  async getSystemInfo(): Promise<FastSDSystemInfo> {
    const installed = await this.isInstalled();
    const running = await this.isRunning();

    const info: FastSDSystemInfo = {
      installed,
      running,
      installPath: this.installPath,
    };

    if (running) {
      try {
        // Obtener info del servidor
        const infoResponse = await axios.get(`${this.apiUrl}/api/info`);
        info.version = infoResponse.data.version;
        info.device = infoResponse.data.device;

        // Obtener modelos disponibles
        const modelsResponse = await axios.get(`${this.apiUrl}/api/models`);
        info.availableModels = modelsResponse.data.models || [];
      } catch (error) {
        console.warn("[FastSD] Could not fetch server info:", error);
      }
    }

    return info;
  }

  /**
   * Inicia el servidor FastSD si no está corriendo
   */
  async startServer(): Promise<boolean> {
    try {
      const running = await this.isRunning();
      if (running) {
        console.log("[FastSD] Server already running");
        return true;
      }

      const installed = await this.isInstalled();
      if (!installed) {
        throw new Error("FastSD not installed. Run installFastSD() first.");
      }

      console.log("[FastSD] Starting server...");

      // Determinar comando según SO
      const platform = process.platform;
      let startCommand: string;

      if (platform === "win32") {
        startCommand = "start-webserver.bat";
      } else {
        startCommand = "./start-webserver.sh";
      }

      // Ejecutar en background
      exec(startCommand, { cwd: this.installPath }, (error) => {
        if (error) {
          console.error("[FastSD] Error starting server:", error);
        }
      });

      // Esperar a que el servidor esté listo (max 30 segundos)
      for (let i = 0; i < 30; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (await this.isRunning()) {
          console.log("[FastSD] Server started successfully");
          return true;
        }
      }

      throw new Error("Server failed to start within 30 seconds");
    } catch (error) {
      console.error("[FastSD] Failed to start server:", error);
      return false;
    }
  }

  /**
   * Instala FastSD CPU automáticamente
   * Requiere aprobación del usuario (se maneja en el service)
   */
  async installFastSD(): Promise<{
    success: boolean;
    message: string;
    installPath: string;
  }> {
    try {
      console.log("[FastSD] Starting installation...");

      const platform = process.platform;

      // Crear directorio de instalación
      if (!fs.existsSync(this.installPath)) {
        fs.mkdirSync(this.installPath, { recursive: true });
      }

      // Clonar repositorio
      console.log("[FastSD] Cloning repository...");
      await execAsync(
        `git clone https://github.com/rupeshs/fastsdcpu.git "${this.installPath}"`
      );

      // Ejecutar instalación según plataforma
      console.log("[FastSD] Running installation script...");

      if (platform === "win32") {
        await execAsync("install.bat", { cwd: this.installPath });
      } else if (platform === "darwin") {
        await execAsync("chmod +x install-mac.sh && ./install-mac.sh", {
          cwd: this.installPath,
        });
      } else {
        // Linux
        await execAsync("chmod +x install.sh && ./install.sh", {
          cwd: this.installPath,
        });
      }

      console.log("[FastSD] Installation completed successfully");

      return {
        success: true,
        message: "FastSD CPU installed successfully",
        installPath: this.installPath,
      };
    } catch (error) {
      console.error("[FastSD] Installation failed:", error);
      return {
        success: false,
        message: `Installation failed: ${error}`,
        installPath: this.installPath,
      };
    }
  }

  /**
   * Genera una imagen usando FastSD CPU
   */
  async generateImage(
    params: FastSDGenerationParams
  ): Promise<FastSDGenerationResult> {
    try {
      // Verificar que el servidor esté corriendo
      const running = await this.isRunning();
      if (!running) {
        if (this.config.autoStart) {
          await this.startServer();
        } else {
          throw new Error(
            "FastSD server not running. Set autoStart: true or start manually."
          );
        }
      }

      console.log("[FastSD] Generating image...");
      const startTime = Date.now();

      // Llamar al endpoint de generación
      const response = await axios.post(
        `${this.apiUrl}/api/generate`,
        {
          prompt: params.prompt,
          negative_prompt: params.negativePrompt || "",
          width: params.width || 512,
          height: params.height || 512,
          num_inference_steps: params.steps || 4,
          guidance_scale: params.guidanceScale || 1.0,
          seed: params.seed || -1, // -1 = random
          use_openvino: params.useOpenVINO ?? true,
          use_taesd: params.useTinyAutoencoder ?? true,
        },
        {
          timeout: 60000, // 60 segundos
        }
      );

      const generationTime = (Date.now() - startTime) / 1000;

      console.log(
        `[FastSD] Image generated in ${generationTime.toFixed(2)}s`
      );

      return {
        imageBase64: response.data.image, // Ya viene en base64
        seed: response.data.seed || params.seed || 0,
        generationTime,
      };
    } catch (error) {
      console.error("[FastSD] Generation failed:", error);
      throw error;
    }
  }

  /**
   * Genera una expresión de personaje
   */
  async generateCharacterExpression(params: {
    characterDescription: string;
    emotionType: string;
    intensity: "low" | "medium" | "high";
    seed?: number;
  }): Promise<{ imageBase64: string; seed: number }> {
    const prompt = this.buildExpressionPrompt(
      params.characterDescription,
      params.emotionType,
      params.intensity
    );

    const result = await this.generateImage({
      prompt,
      negativePrompt:
        "text, watermark, signature, ugly, deformed, blurry, low quality, bad anatomy, multiple people, crowd",
      width: 512,
      height: 512,
      steps: 4, // LCM rápido
      guidanceScale: 1.5,
      seed: params.seed,
      useOpenVINO: true,
      useTinyAutoencoder: true,
    });

    return {
      imageBase64: result.imageBase64,
      seed: result.seed,
    };
  }

  /**
   * Construye prompt de expresión emocional
   */
  private buildExpressionPrompt(
    characterDescription: string,
    emotionType: string,
    intensity: "low" | "medium" | "high"
  ): string {
    const emotionDescriptors: Record<string, Record<string, string>> = {
      neutral: {
        low: "calm expression, neutral face, relaxed",
        medium: "neutral expression, composed, serene",
        high: "completely neutral, emotionless, blank stare",
      },
      joy: {
        low: "subtle smile, gentle happiness, soft expression",
        medium: "bright smile, joyful expression, happy eyes",
        high: "wide smile, laughing, very happy, radiant expression",
      },
      distress: {
        low: "slightly worried, minor concern, subtle frown",
        medium: "worried expression, distressed, anxious look",
        high: "very distressed, crying, tears, anguished expression",
      },
      fear: {
        low: "slightly nervous, cautious look",
        medium: "fearful expression, scared, wide eyes",
        high: "terrified, extreme fear, panic in eyes",
      },
      anger: {
        low: "slightly annoyed, mild frustration",
        medium: "angry expression, furrowed brows, tense",
        high: "furious, very angry, intense rage",
      },
      affection: {
        low: "warm expression, gentle smile, caring look",
        medium: "loving expression, tender, affectionate gaze",
        high: "very loving, deeply affectionate, passionate",
      },
      concern: {
        low: "slightly concerned, thoughtful expression",
        medium: "concerned look, worried about someone, caring",
        high: "very concerned, deeply worried, protective",
      },
      curiosity: {
        low: "interested look, slight curiosity",
        medium: "curious expression, inquisitive, engaged",
        high: "very curious, fascinated, wide-eyed wonder",
      },
      surprise: {
        low: "slightly surprised, raised eyebrows",
        medium: "surprised expression, open mouth, shocked",
        high: "extremely surprised, astonished, jaw dropped",
      },
      excitement: {
        low: "slightly excited, eager expression",
        medium: "excited, enthusiastic, energetic",
        high: "very excited, thrilled, ecstatic expression",
      },
    };

    const emotionDesc =
      emotionDescriptors[emotionType]?.[intensity] || "neutral expression";

    return `professional portrait photo, ${characterDescription}, ${emotionDesc}, photorealistic, detailed face, natural lighting, high quality, 8k uhd, sharp focus`;
  }

  /**
   * Descarga modelo NSFW de Civitai (opcional)
   */
  async downloadNSFWModel(modelId: string): Promise<boolean> {
    // TODO: Implementar descarga desde Civitai
    // Por ahora FastSD usa modelos por defecto
    console.warn("[FastSD] Custom model download not implemented yet");
    return false;
  }
}

/**
 * Singleton para reutilizar la misma instancia
 */
let fastSDClientInstance: FastSDLocalClient | null = null;

export function getFastSDLocalClient(
  config?: FastSDConfig
): FastSDLocalClient {
  if (!fastSDClientInstance) {
    fastSDClientInstance = new FastSDLocalClient(config);
  }
  return fastSDClientInstance;
}
