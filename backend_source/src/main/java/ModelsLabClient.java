import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.json.JSONObject;
import org.json.JSONArray;

public class ModelsLabClient {

    private static final String API_URL = "https://modelslab.com/api/v6/realtime/img2img";
    private final String apiKey;
    private final HttpClient client;
    
    public ModelsLabClient(String apiKey) {
        this.apiKey = apiKey;
        this.client = HttpClient.newHttpClient();
    }
    
    /**
     * Generate an image from an input image using the image-to-image API
     */
    public String generateImage(ImageToImageRequest request) throws Exception {
        // Build JSON request body
        JSONObject json = new JSONObject();
        json.put("key", apiKey);
        json.put("model_id", request.modelId);
        json.put("prompt", request.prompt);
        json.put("init_image", request.initImageUrl);
        json.put("width", 512);
        json.put("height", 512);
        json.put("samples", request.samples);
        json.put("num_inference_steps", request.numInferenceSteps);
        json.put("guidance_scale", request.guidanceScale);
        json.put("strength", request.strength);
        json.put("safety_checker", false);
        json.put("base64", "no");
        json.put("enhance_prompt", false);
        json.put("instant_response", false);
        json.put("n_samples", 1);
        json.put("opacity", 0.7);
        json.put("outdir", "out");
        json.put("padding_down", 10);
        json.put("padding_right", 10);
        json.put("scale_down", 6);
        json.put("seed", 3555263009L);
        json.put("temp", false);
        json.put("watermark", "no");
        
        /*
         *     "base64": "no",
    "enhance_prompt": "no",
    "enhance_style": null,
    "file_prefix": "89e8314c-418c-40d5-8aed-1823702b8cb3",
    "guidance_scale": 1,
    "height": 512,
    "id": "157244430",
    "init_image": "https://i.postimg.cc/XNDscypX/annime-jpeg.png",
    "instant_response": "no",
    "n_samples": 1,
    "negative_prompt": "ugly, blurry, bad anatomy",
    "opacity": 0.7,
    "outdir": "out",
    "padding_down": 10,
    "padding_right": 10,
    "pag_scale": 0.2,
    "prompt": "realistic and epic",
    "rescale": "yes",
    "safety_checker": "no",
    "safety_checker_type": "black",
    "scale_down": 6,
    "seed": 3555263009,
    "strength": 0.95,
    "temp": "no",
    "track_id": null,
    "watermark": "no",
    "webhook": null,
    "width": 512
         */
        if (request.negativePrompt != null) {
            json.put("negative_prompt", request.negativePrompt);
        }
        if (request.scheduler != null) {
            json.put("scheduler", request.scheduler);
        }
        if (request.seed != null) {
            json.put("seed", request.seed);
        }
        if (request.webhook != null) {
            json.put("webhook", request.webhook);
        }
        
        // Create HTTP request
        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(API_URL))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json.toString()))
                .build();
        
        // Send request and get response
        HttpResponse<String> response = client.send(httpRequest, 
                HttpResponse.BodyHandlers.ofString());
        
        // Parse response
        JSONObject responseJson = new JSONObject(response.body());
        
        if ("success".equals(responseJson.optString("status"))) {
            JSONArray outputArray = responseJson.getJSONArray("output");
            return outputArray.getString(0); // Return first generated image URL
        } else if ("processing".equals(responseJson.optString("status"))) {
            // Image is being processed in background
            String fetchUrl = responseJson.optString("fetch_result");
            int eta = responseJson.optInt("eta");
            System.out.println("Image processing. ETA: " + eta + " seconds");
            System.out.println("Fetch URL: " + fetchUrl);
            
            // Wait and fetch the result
            Thread.sleep(eta * 1000L);
            return fetchQueuedImage(fetchUrl);
        } else {
            throw new Exception("API Error: " + responseJson.optString("message"));
        }
    }
    
    /**
     * Fetch a queued/processing image
     */
    private String fetchQueuedImage(String fetchUrl) throws Exception {
        JSONObject json = new JSONObject();
        json.put("key", apiKey);
        
        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(fetchUrl))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json.toString()))
                .build();
        
        HttpResponse<String> response = client.send(httpRequest, 
                HttpResponse.BodyHandlers.ofString());
        
        JSONObject responseJson = new JSONObject(response.body());
        
        if (responseJson.optString("status").equals("success")) {
            JSONArray outputArray = responseJson.getJSONArray("output");
            return outputArray.getString(0);
        } else {
            throw new Exception("Failed to fetch image: " + responseJson.optString("message"));
        }
    }
    
    /**
     * Request builder class for image-to-image generation
     */
    public static class ImageToImageRequest {
        String modelId = "realistic-vision-51";
        String prompt;
        String negativePrompt;
        String initImageUrl;
        int samples = 1;
        int numInferenceSteps = 30;
        double guidanceScale = 1;
        double strength = 0.90;
        String scheduler = "UniPCMultistepScheduler";
        Integer seed;
        String webhook;
        
        public ImageToImageRequest(String prompt, String initImageUrl) {
            this.prompt = prompt;
            this.initImageUrl = initImageUrl;
        }
    }
        public static void main(String[] args) {
            try {
                String apiKey = System.getenv("MODELSLAB_API_KEY");
                ModelsLabClient api = new ModelsLabClient(apiKey);
                
                // Create request
                ImageToImageRequest request = new ImageToImageRequest(
                    "realistic",
                    "https://i.postimg.cc/tTNy1Gb8/person.png"
                );
                
                // Generate image
                String imageUrl = api.generateImage(request);
                System.out.println("Generated image URL: " + imageUrl);
                
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
}
// ...existing code...