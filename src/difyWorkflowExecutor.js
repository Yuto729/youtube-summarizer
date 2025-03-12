export const summarizeVideo = async (video) => {
  try {
    const response = await fetch(`${process.env.DIFY_API_ENDPOINT}/workflows/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DIFY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: {
          id: video.id,
        },
        response_mode: "blocking",
        user: "0deb4489-f0e2-4b06-a7ab-ffa12152a297"
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Dify API Error: ${response.status} ${response.statusText}`);
    }

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