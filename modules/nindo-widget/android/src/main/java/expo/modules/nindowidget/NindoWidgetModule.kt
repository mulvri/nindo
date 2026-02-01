package expo.modules.nindowidget

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.util.Log
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.os.Build

class NindoWidgetModule : Module() {
  private val context get() = requireNotNull(appContext.reactContext)

  override fun definition() = ModuleDefinition {
    Name("NindoWidget")

    AsyncFunction("updateWidgetData") { data: String ->
      Log.d("NindoWidget", "Received widget data update: $data")
      true
    }

    AsyncFunction("startBackgroundUpdates") {
      Log.d("NindoWidget", "Scheduling Sensei WakeUp periodic updates...")
      val workRequest = PeriodicWorkRequestBuilder<NindoWidgetWorker>(24, TimeUnit.HOURS)
        .addTag("nindo-daily-update")
        .build()

      WorkManager.getInstance(context).enqueueUniquePeriodicWork(
        "NindoDailyQuote",
        ExistingPeriodicWorkPolicy.KEEP,
        workRequest
      )
      true
    }

    AsyncFunction("stopBackgroundUpdates") {
      Log.d("NindoWidget", "Stopping background updates...")
      WorkManager.getInstance(context).cancelUniqueWork("NindoDailyQuote")
      true
    }

    AsyncFunction("isPinSupported") {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val appWidgetManager = context.getSystemService(AppWidgetManager::class.java)
            appWidgetManager.isRequestPinAppWidgetSupported
        } else {
            false
        }
    }

    AsyncFunction("requestPinWidget") {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val appWidgetManager = context.getSystemService(AppWidgetManager::class.java)
            val myProvider = ComponentName(context, "expo.modules.nindowidget.NindoWidgetReceiver")
            
            if (appWidgetManager.isRequestPinAppWidgetSupported) {
                appWidgetManager.requestPinAppWidget(myProvider, null, null)
                true
            } else {
                false
            }
        } else {
            false
        }
    }
  }
}
