package com.voicesphere

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import android.provider.Settings

class DeviceModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    override fun getName(): String {
        return "DeviceInfo"
    }

    @ReactMethod
    fun getUniqueId(promise: Promise) {
        try {
            val androidId = Settings.Secure.getString(reactApplicationContext.contentResolver, Settings.Secure.ANDROID_ID)
            promise.resolve(androidId)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message, e)
        }
    }

    override fun getConstants(): Map<String, Any> {
        val constants: MutableMap<String, Any> = HashMap()
        val androidId = Settings.Secure.getString(reactApplicationContext.contentResolver, Settings.Secure.ANDROID_ID) ?: "unknown"
        constants["UNIQUE_ID"] = androidId
        return constants
    }
}
