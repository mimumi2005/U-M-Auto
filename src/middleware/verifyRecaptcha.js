export async function verifyRecaptcha(req, res, next) {
    const recaptchaResponse = req.body['g-recaptcha-response'];
    const secretKey = process.env.RECAPTCHA_SECRET_KEY; // Use the environment variable

    // Check if the reCAPTCHA response is provided
    if (!recaptchaResponse) {
        return res.status(400).send('CAPTCHA response is missing.');
    }

    const postData = new URLSearchParams({
        secret: secretKey,
        response: recaptchaResponse,
    });

    try {
        const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            body: postData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const result = await response.json(); // Parse the JSON response

        if (result.success) {
            next(); // Proceed if verification is successful
        } else {
            res.status(400).send('CAPTCHA verification failed. Please try again.');
        }
    } catch (error) {
        console.error('CAPTCHA verification error:', error);
        res.status(500).send('Internal server error. Please try again later.');
    }
}