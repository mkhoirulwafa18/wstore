import axios from "axios";
import { NextResponse } from "next/server";

const http = axios.create()
let midtransConfig = {
    isProduction: process.env.MIDTRANS_CONFIG_IS_PRODUCTION,
    serverKey: process.env.MIDTRANS_CONFIG_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CONFIG_CLIENT_KEY
};

export const createTransaction = (parameter = {}) => {
    let apiUrl = process.env.MIDTRANS_SNAP_SANDBOX_BASE_URL + '/transactions';
    let responsePromise = request(
        midtransConfig.serverKey ?? '',
        apiUrl,
        parameter);
    return responsePromise;
}

const request = (
    serverKey: string,
    requestUrl: string,
    firstParam = {},
    secondParam = {}
) => {
    let headers = {
        'content-type': 'application/json',
        'accept': 'application/json',
        'user-agent': 'midtransclient-nodejs/1.3.0'
    };

    const reqBodyPayload = firstParam;
    const reqQueryParam = secondParam;

    return new Promise(function (resolve, reject) {

        http.post(requestUrl, reqBodyPayload, {
            headers: headers,
            params: reqQueryParam,
            auth: {
                username: serverKey,
                password: ''
            }
        }).then(function (res) {
            // Reject core API error status code
            if (res.data.hasOwnProperty('status_code') && res.data.status_code >= 400 && res.data.status_code != 407) {
                // 407 is expected get-status API response for `expire` transaction, non-standard
                reject(new NextResponse(
                    `Midtrans API is returning API error. HTTP status code: ${res.data.status_code}. API response: ${JSON.stringify(res.data)}`,
                    { status: res.data.status_code, }
                )
                )
            }
            resolve(res.data);
        }).catch(function (err) {
            let res = err.response;
            // Reject API error HTTP status code
            if (typeof res !== 'undefined' && res.status >= 400) {
                reject(
                    new NextResponse(
                        `Midtrans API is returning API error. HTTP status code: ${res.status}. API response: ${JSON.stringify(res.data)}`,
                        { status: res.data.status, }
                    )
                )
                // Reject API undefined HTTP response 
            } else if (typeof res === 'undefined') {
                reject(
                    new NextResponse(
                        `Midtrans API request failed. HTTP response not found, likely connection failure, with message: ${JSON.stringify(err.message)}`
                    )
                )
            }
            reject(err);
        })
    });
}