import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);

const run = async (prompt, base64Image = null) => {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // use gemini-1.5-flash or gemini-1.5-pro or gemini-1.5-pro-exp-0827

    let result;
    if (base64Image) {
        const image = {
            inlineData: {
                data: base64Image,  // Use the base64 image data passed from the browser
                mimeType: "image/jpeg",  // Adjust if necessary
            },
        };
        
        // Log the image object to verify
        console.log("Image Object:", image);

        // Send prompt and image to the API
        result = await model.generateContent([prompt, image]);
    } else {
        // If no image, just send the prompt
        result = await model.generateContent([prompt]);
    }

    console.log(result.response.text());
    return result.response.text();
};

export default run;
