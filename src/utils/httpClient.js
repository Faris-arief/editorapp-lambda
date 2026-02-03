const https = require('https');
const http = require('http');

/**
 * HTTP Client utility for making API requests
 */
class HttpClient {
    /**
     * Make an HTTP request
     * @param {Object} options - Request options
     * @param {string} options.url - Full URL
     * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE)
     * @param {Object} options.headers - Request headers
     * @param {Object|string} options.body - Request body
     * @param {number} options.timeout - Request timeout in ms (default: 10000)
     * @returns {Promise<Object>} Response object with status, headers, and data
     */
    static async request(options = {}) {
        const {
            url,
            method = 'GET',
            headers = {},
            body = null,
            timeout = 10000
        } = options;

        return new Promise((resolve, reject) => {
            try {
                const urlObj = new URL(url);
                const isHttps = urlObj.protocol === 'https:';
                const client = isHttps ? https : http;

                // Default headers
                const defaultHeaders = {
                    'Content-Type': 'application/json',
                    'User-Agent': 'EditorApp-Lambda/1.0.0'
                };

                const requestOptions = {
                    hostname: urlObj.hostname,
                    port: urlObj.port || (isHttps ? 443 : 80),
                    path: urlObj.pathname + urlObj.search,
                    method: method.toUpperCase(),
                    headers: { ...defaultHeaders, ...headers },
                    timeout
                };

                // Add Content-Length for POST/PUT requests with body
                if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
                    const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
                    requestOptions.headers['Content-Length'] = Buffer.byteLength(bodyString);
                }

                const req = client.request(requestOptions, (res) => {
                    let data = '';

                    res.on('data', (chunk) => {
                        data += chunk;
                    });

                    res.on('end', () => {
                        try {
                            const response = {
                                status: res.statusCode,
                                statusText: res.statusMessage,
                                headers: res.headers,
                                data: data
                            };

                            // Try to parse JSON response
                            if (res.headers['content-type']?.includes('application/json')) {
                                try {
                                    response.data = JSON.parse(data);
                                } catch (parseError) {
                                    console.warn('Failed to parse JSON response:', parseError.message);
                                }
                            }

                            resolve(response);
                        } catch (error) {
                            reject(new Error(`Response parsing error: ${error.message}`));
                        }
                    });
                });

                req.on('error', (error) => {
                    reject(new Error(`Request error: ${error.message}`));
                });

                req.on('timeout', () => {
                    req.destroy();
                    reject(new Error(`Request timeout after ${timeout}ms`));
                });

                // Write body if present
                if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
                    const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
                    req.write(bodyString);
                }

                req.end();

            } catch (error) {
                reject(new Error(`Request setup error: ${error.message}`));
            }
        });
    }

    /**
     * Make a GET request
     */
    static async get(url, options = {}) {
        return this.request({ ...options, url, method: 'GET' });
    }

    /**
     * Make a POST request
     */
    static async post(url, body = null, options = {}) {
        return this.request({ ...options, url, method: 'POST', body });
    }

    /**
     * Make a PUT request
     */
    static async put(url, body = null, options = {}) {
        return this.request({ ...options, url, method: 'PUT', body });
    }

    /**
     * Make a DELETE request
     */
    static async delete(url, options = {}) {
        return this.request({ ...options, url, method: 'DELETE' });
    }
}

module.exports = HttpClient;