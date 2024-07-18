const axios = require('axios');
const Story = require('../Models/story');

const HUGGING_FACE_API_URL = 'https://api-inference.huggingface.co/models/facebook/bart-large-cnn';
const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY;

const stripHtmlTags = (html) => {
  return html.replace(/<[^>]*>/g, '');
};

const summarizeTextWithHuggingFace = async (text) => {
  try {
    const response = await axios.post(
      HUGGING_FACE_API_URL,
      { inputs: text },
      {
        headers: {
          'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data[0].summary_text;
  } catch (error) {
    console.error('Error in Hugging Face summarization:', error);
    throw new Error('Unable to generate summary at this time.');
  }
};

const processChatbotQuery = async (req, res) => {
  const { storyId } = req.body;

  try {
    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    const cleanContent = stripHtmlTags(story.content);
    const summary = await summarizeTextWithHuggingFace(cleanContent);

    res.json({
      title: story.title,
      summary: summary
    });
  } catch (error) {
    console.error('Error processing chatbot query:', error);
    res.status(500).json({ error: 'Failed to generate summary. Please try again.' });
  }
};

module.exports = {
  processChatbotQuery
};