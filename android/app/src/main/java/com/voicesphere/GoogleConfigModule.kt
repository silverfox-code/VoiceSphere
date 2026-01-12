package com.voicesphere

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import android.provider.Settings

class GoogleConfigModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    override fun getName(): String {
        return "GoogleConfig"
    }

    @ReactMethod
    fun getWebClientId(promise: Promise) {
        try {
            val webClientId = BuildConfig.WEB_CLIENT_ID
            promise.resolve(webClientId)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message, e)
        }
    }

    override fun getConstants(): Map<String, Any> {
        val constants: MutableMap<String, Any> = HashMap()
        constants["WEB_CLIENT_ID"] = BuildConfig.WEB_CLIENT_ID
        return constants
    }
}
