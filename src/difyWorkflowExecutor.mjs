export const summarizeVideo = async (video, apiKey) => {
  try {
    const response = await fetch(`https://api.dify.ai/v1/workflows/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: {
          id: video.id,
          title: video.title,
          description: video.description
        },
        response_mode: "blocking",
        user: "0deb4489-f0e2-4b06-a7ab-ffa12152a297"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Dify API Error: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const data = await response.json();

    if (data.data.error) {
      throw new Error(`Dify Workflow Error: ${data.data.error}`);
    }

    if (data.data.status !== 'succeeded') {
      throw new Error(`Dify Workflow Failed: ${data.data.status}`);
    }

    return data.data.outputs;
  } catch (error) {
    console.error('Dify API Error:', error);
    throw error;
  }
}; 