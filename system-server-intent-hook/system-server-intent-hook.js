function parse_intent(intent) {

	var categories = intent.getCategories()
        var data = intent.getData()
        var extras = intent.getExtras()
        var comp = intent.getComponent()
        var comppackage = null
        var compclazz = null

        if(categories && !categories.isEmpty()) {
	    try {
	    	var iter = categories.iterator()
	    	var c = []

	    	while(iter.hasNext()) {
	    	    var v = iter.next()
	    	    c.push(Java.cast(v, Java.use("java.lang.String")).toString())
	    	}
	    } catch(e) {
		c = e
	    }
	    categories = c
	}

        if(extras) {
            var iter = extras.keySet().iterator()
            var e = {}
            try {
                while(iter.hasNext()) {
                        var k = iter.next()
                        e[k] = extras.get(k).toString()
                }
            } catch (e) {
              e = extras.toString()
            }
            extras = e
        }

        if(data) {
            data = data.toString()
        }
        if(comp) {
            comppackage = comp.getPackageName()
            compclazz = comp.getClassName()
        }

        return {
            "action": intent.getAction(),
	    "categories": categories,
            "data": data,
            "extras": extras,
            "flags": flags2str(parseInt(intent.getFlags())),
            "package": comppackage,
            "class": compclazz
        }
}

function flags2str(flags) {
    var flag_map = {
	0x00000001: "FLAG_GRANT_READ_URI_PERMISSION",
	0x00000002: "FLAG_GRANT_WRITE_URI_PERMISSION",
	0x00000004: "FLAG_FROM_BACKGROUND",
	0x00000008: "FLAG_DEBUG_LOG_RESOLUTION",
	0x00000010: "FLAG_EXCLUDE_STOPPED_PACKAGES",
	0x00000020: "FLAG_INCLUDE_STOPPED_PACKAGES",
	0x00000040: "FLAG_GRANT_PERSISTABLE_URI_PERMISSION",
	0x00000080: "FLAG_GRANT_PREFIX_URI_PERMISSION",
	0x00000100: "FLAG_DIRECT_BOOT_AUTO",
	0x00000200: "FLAG_ACTIVITY_REQUIRE_DEFAULT or FLAG_IGNORE_EPHEMERAL",
	0x00000400: "FLAG_ACTIVITY_REQUIRE_NON_BROWSER",
	0x00000800: "FLAG_ACTIVITY_MATCH_EXTERNAL or FLAG_RECEIVER_OFFLOAD_FOREGROUND",
	0x00001000: "FLAG_ACTIVITY_LAUNCH_ADJACENT",
	0x00002000: "FLAG_ACTIVITY_RETAIN_IN_RECENTS",
	0X00004000: "FLAG_ACTIVITY_TASK_ON_HOME",
	0X00008000: "FLAG_ACTIVITY_CLEAR_TASK",
	0X00010000: "FLAG_ACTIVITY_NO_ANIMATION",
	0X00020000: "FLAG_ACTIVITY_REORDER_TO_FRONT",
	0x00040000: "FLAG_ACTIVITY_NO_USER_ACTION",
	0x00080000: "FLAG_ACTIVITY_CLEAR_WHEN_TASK_RESET",
	0x00100000: "FLAG_ACTIVITY_LAUNCHED_FROM_HISTORY",
	0x00200000: "FLAG_ACTIVITY_RESET_TASK_IF_NEEDED or FLAG_RECEIVER_VISIBLE_TO_INSTANT_APPS",
	0x00400000: "FLAG_ACTIVITY_BROUGHT_TO_FRONT or FLAG_RECEIVER_FROM_SHELL",
	0x00800000: "FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS or FLAG_RECEIVER_EXCLUDE_BACKGROUND",
	0x01000000: "FLAG_ACTIVITY_PREVIOUS_IS_TOP or FLAG_RECEIVER_INCLUDE_BACKGROUND",
	0x02000000: "FLAG_ACTIVITY_FORWARD_RESULT or FLAG_RECEIVER_BOOT_UPGRADE",
	0x04000000: "FLAG_ACTIVITY_CLEAR_TOP or FLAG_RECEIVER_REGISTERED_ONLY_BEFORE_BOOT",
	0x08000000: "FLAG_ACTIVITY_MULTIPLE_TASK or FLAG_RECEIVER_NO_ABORT",
	0x10000000: "FLAG_ACTIVITY_NEW_TASK or FLAG_RECEIVER_FOREGROUND",
	0x20000000: "FLAG_ACTIVITY_SINGLE_TOP or FLAG_RECEIVER_REPLACE_PENDING",
	0x40000000: "FLAG_ACTIVITY_NO_HISTORY or FLAG_RECEIVER_REGISTERED_ONLY",
	0x80000000: "FLAG_RECEIVER_OFFLOAD"
    }
    var res = []
    for(const k in flag_map) {
	if((k & flags) == k) {
	    res.push(flag_map[k])
	}
    }

    return res
}


Java.perform(() => {
    const IntentResolver = Java.use("com.android.server.IntentResolver");
    var sdkVersion = Java.use("android.os.Build$VERSION").SDK_INT.value

    if(sdkVersion >= 33) {
	// in sdk 33 queryIntent has a additional snapshot and flag parameter

	const queryIntent = IntentResolver.queryIntent.overload('com.android.server.pm.snapshot.PackageDataSnapshot', 'android.content.Intent', 'java.lang.String', 'boolean', 'int', 'long');

	queryIntent.implementation = function(snapshot, intent, resolvedType, defaultOnly, userId, flags) {
	    // https://cs.android.com/android/platform/superproject/main/+/main:frameworks/base/services/core/java/com/android/server/IntentResolver.java;l=448
	    // android 13: "<instance: com.android.server.pm.snapshot.PackageDataSnapshot, $className: com.android.server.pm.ComputerEngine>", "<instance: android.content.Intent>", null, false, 0
	
	    send(parse_intent(intent))
	    return queryIntent.call(this, snapshot, intent, resolvedType, defaultOnly, userId, flags);
	}
    } else {
	// tested with sdk 31, 30, 29 and 28 
	const queryIntent = IntentResolver.queryIntent.overload('android.content.Intent', 'java.lang.String', 'boolean', 'int');

	queryIntent.implementation = function(intent, resolvedType, defaultOnly, userId) {
	    send(parse_intent(intent));
	    return queryIntent.call(this, intent, resolvedType, defaultOnly, userId);
	}
    }


})
