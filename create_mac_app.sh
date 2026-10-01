#!/bin/bash
# ==============================================================================
# 🚀 FoFo 个人工作台 - macOS 专属原生应用构建脚本 (生成 /Applications/FoFo.app)
# 功能：
# 1. 自动生成纯净白底高保真 Apple 规范 Squircle 图标 (appIcon.icns)
# 2. 编译 Native Cocoa + WKWebView 独立桌面端容器 (独立进程与程序坞独立图标)
# 3. 彻底与 Edge / Chrome 浏览器解耦，拥有完全独立的桌面窗口与全局快捷键
# ==============================================================================
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

echo "🎨 1. 正在生成纯净白底 Apple Squircle 高清应用图标 (appIcon.icns)..."
cat << 'EOF' > /tmp/create_white_icon.m
#import <Cocoa/Cocoa.h>

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        int canvasSize = 1024;
        NSString *imgPath = [NSString stringWithUTF8String:argv[1]];
        NSImage *sparkle = [[NSImage alloc] initWithContentsOfFile:imgPath];
        if (!sparkle) {
            NSLog(@"Failed to load image");
            return 1;
        }

        NSImage *output = [[NSImage alloc] initWithSize:NSMakeSize(canvasSize, canvasSize)];
        [output lockFocus];

        // Apple HIG 官方 macOS App 图标尺寸黄金平衡校准:
        // 画布: 1024x1024
        // 取 824px (标准偏大) 与 756px (微小) 之间的黄金平衡中值: 790x790 (留白 117px)
        // 与 App Store、设置等系统级应用达到真正的肉眼绝对等大与像素级平衡
        CGFloat squircleSize = 790.0;
        CGFloat padding = (canvasSize - squircleSize) / 2.0; // 117.0
        CGFloat radius = squircleSize * 0.2237; // ~176.7px (Apple 连续曲率 Squircle)

        NSRect squircleRect = NSMakeRect(padding, padding, squircleSize, squircleSize);

        NSGraphicsContext *context = [NSGraphicsContext currentContext];
        [context saveGraphicsState];

        // 原生 macOS 应用柔和立体阴影 (在 117px 留白区域自然扩散)
        NSShadow *shadow = [[NSShadow alloc] init];
        [shadow setShadowColor:[NSColor colorWithCalibratedWhite:0.0 alpha:0.18]];
        [shadow setShadowOffset:NSMakeSize(0, -9)];
        [shadow setShadowBlurRadius:17.0];
        [shadow set];

        NSBezierPath *path = [NSBezierPath bezierPathWithRoundedRect:squircleRect xRadius:radius yRadius:radius];
        [[NSColor whiteColor] setFill];
        [path fill];

        [context restoreGraphicsState];

        // 微弱柔和描边 (1px 浅灰边框增强浅色壁纸对比)
        [[NSColor colorWithCalibratedWhite:0.0 alpha:0.07] setStroke];
        [path setLineWidth:1.5];
        [path stroke];

        // 居中绘制专属 Sparkle 星标 (主体内 69% 比例: ~545px)
        CGFloat iconSize = squircleSize * 0.69;
        CGFloat iconOffset = (canvasSize - iconSize) / 2.0;
        NSRect iconRect = NSMakeRect(iconOffset, iconOffset, iconSize, iconSize);
        [sparkle drawInRect:iconRect fromRect:NSZeroRect operation:NSCompositingOperationSourceOver fraction:1.0];

        [output unlockFocus];

        CGImageRef cgImage = [output CGImageForProposedRect:NULL context:NULL hints:nil];
        NSBitmapImageRep *rep = [[NSBitmapImageRep alloc] initWithCGImage:cgImage];
        NSData *pngData = [rep representationUsingType:NSBitmapImageFileTypePNG properties:@{}];
        [pngData writeToFile:@"/tmp/sparkle_white.png" atomically:YES];
    }
    return 0;
}
EOF

clang -framework Cocoa /tmp/create_white_icon.m -o /tmp/create_white_icon
/tmp/create_white_icon "$DIR/sparkle.png"
rm -f /tmp/create_white_icon.m /tmp/create_white_icon

mkdir -p /tmp/FoFo.iconset
sips -z 16 16     /tmp/sparkle_white.png --out /tmp/FoFo.iconset/icon_16x16.png > /dev/null
sips -z 32 32     /tmp/sparkle_white.png --out /tmp/FoFo.iconset/icon_16x16@2x.png > /dev/null
sips -z 32 32     /tmp/sparkle_white.png --out /tmp/FoFo.iconset/icon_32x32.png > /dev/null
sips -z 64 64     /tmp/sparkle_white.png --out /tmp/FoFo.iconset/icon_32x32@2x.png > /dev/null
sips -z 128 128   /tmp/sparkle_white.png --out /tmp/FoFo.iconset/icon_128x128.png > /dev/null
sips -z 256 256   /tmp/sparkle_white.png --out /tmp/FoFo.iconset/icon_128x128@2x.png > /dev/null
sips -z 256 256   /tmp/sparkle_white.png --out /tmp/FoFo.iconset/icon_256x256.png > /dev/null
sips -z 512 512   /tmp/sparkle_white.png --out /tmp/FoFo.iconset/icon_256x256@2x.png > /dev/null
sips -z 512 512   /tmp/sparkle_white.png --out /tmp/FoFo.iconset/icon_512x512.png > /dev/null
sips -z 1024 1024 /tmp/sparkle_white.png --out /tmp/FoFo.iconset/icon_512x512@2x.png > /dev/null
iconutil -c icns /tmp/FoFo.iconset -o "$DIR/appIcon.icns"
rm -rf /tmp/FoFo.iconset /tmp/sparkle_white.png

echo "🔨 2. 正在编译 Native Cocoa + WKWebView 原生独立客户端..."
cat << 'EOF' > /tmp/main.m
#import <Cocoa/Cocoa.h>
#import <WebKit/WebKit.h>
#include <unistd.h>
#include <sys/stat.h>
#include <fcntl.h>

@interface AppDelegate : NSObject <NSApplicationDelegate, WKNavigationDelegate, WKUIDelegate>
@property (strong, nonatomic) NSWindow *window;
@property (strong, nonatomic) WKWebView *webView;
@property (assign, nonatomic) NSInteger retryCount;
@end

@implementation AppDelegate

- (void)applicationDidFinishLaunching:(NSNotification *)notification {
    self.retryCount = 0;
    
    NSString *iconPath = [[NSBundle mainBundle] pathForResource:@"appIcon" ofType:@"icns"];
    if (iconPath) {
        NSImage *icon = [[NSImage alloc] initWithContentsOfFile:iconPath];
        if (icon) {
            [NSApp setApplicationIconImage:icon];
        }
    }
    
    [self ensureServerRunning];
    [self setupMenuBar];
    [self createWindow];
}

- (void)ensureServerRunning {
    if (system("curl -s -m 1 http://localhost:3210/api/ping > /dev/null 2>&1") != 0) {
        const char *self_use_dir = "/Users/fulin/Projects/FoFo_macOS";
        const char *dev_dir = "/Users/fulin/Projects/FoFo_development";
        struct stat st;
        const char *target_dir = (stat(self_use_dir, &st) == 0) ? self_use_dir : dev_dir;
        
        const char *py_bin = "/usr/local/bin/python3";
        if (access(py_bin, X_OK) != 0) {
            py_bin = "/usr/bin/python3";
        }
        
        pid_t pid = fork();
        if (pid == 0) {
            setsid();
            pid_t pid2 = fork();
            if (pid2 == 0) {
                chdir(target_dir);
                setenv("FOFO_NO_BROWSER", "1", 1);
                int devnull = open("/dev/null", O_RDWR);
                if (devnull >= 0) {
                    dup2(devnull, STDIN_FILENO);
                    dup2(devnull, STDOUT_FILENO);
                    dup2(devnull, STDERR_FILENO);
                    close(devnull);
                }
                execl(py_bin, py_bin, "server.py", (char *)NULL);
                _exit(1);
            }
            _exit(0);
        }
        
        for (int i = 0; i < 35; i++) {
            usleep(100000);
            if (system("curl -s -m 1 http://localhost:3210/api/ping > /dev/null 2>&1") == 0) break;
        }
    }
}

- (void)setupMenuBar {
    NSMenu *mainMenu = [[NSMenu alloc] init];
    
    // App Menu
    NSMenuItem *appMenuItem = [[NSMenuItem alloc] init];
    NSMenu *appMenu = [[NSMenu alloc] initWithTitle:@"FoFo"];
    [appMenu addItemWithTitle:@"关于 FoFo 工作台" action:@selector(orderFrontStandardAboutPanel:) keyEquivalent:@""];
    [appMenu addItem:[NSMenuItem separatorItem]];
    [appMenu addItemWithTitle:@"隐藏 FoFo" action:@selector(hide:) keyEquivalent:@"h"];
    NSMenuItem *hideOthers = [appMenu addItemWithTitle:@"隐藏其他" action:@selector(hideOtherApplications:) keyEquivalent:@"h"];
    [hideOthers setKeyEquivalentModifierMask:(NSEventModifierFlagOption | NSEventModifierFlagCommand)];
    [appMenu addItemWithTitle:@"全部显示" action:@selector(unhideAllApplications:) keyEquivalent:@""];
    [appMenu addItem:[NSMenuItem separatorItem]];
    [appMenu addItemWithTitle:@"退出 FoFo" action:@selector(terminate:) keyEquivalent:@"q"];
    [appMenuItem setSubmenu:appMenu];
    [mainMenu addItem:appMenuItem];
    
    // Edit Menu
    NSMenuItem *editMenuItem = [[NSMenuItem alloc] init];
    NSMenu *editMenu = [[NSMenu alloc] initWithTitle:@"编辑"];
    [editMenu addItemWithTitle:@"撤销" action:@selector(undo:) keyEquivalent:@"z"];
    [editMenu addItemWithTitle:@"重做" action:@selector(redo:) keyEquivalent:@"Z"];
    [editMenu addItem:[NSMenuItem separatorItem]];
    [editMenu addItemWithTitle:@"剪切" action:@selector(cut:) keyEquivalent:@"x"];
    [editMenu addItemWithTitle:@"复制" action:@selector(copy:) keyEquivalent:@"c"];
    [editMenu addItemWithTitle:@"粘贴" action:@selector(paste:) keyEquivalent:@"v"];
    [editMenu addItemWithTitle:@"全选" action:@selector(selectAll:) keyEquivalent:@"a"];
    [editMenuItem setSubmenu:editMenu];
    [mainMenu addItem:editMenuItem];

    // View Menu
    NSMenuItem *viewMenuItem = [[NSMenuItem alloc] init];
    NSMenu *viewMenu = [[NSMenu alloc] initWithTitle:@"视图"];
    [viewMenu addItemWithTitle:@"刷新" action:@selector(reloadPage) keyEquivalent:@"r"];
    [viewMenu addItem:[NSMenuItem separatorItem]];
    [viewMenu addItemWithTitle:@"切换全屏" action:@selector(toggleFullScreen:) keyEquivalent:@"f"];
    [viewMenuItem setSubmenu:viewMenu];
    [mainMenu addItem:viewMenuItem];
    
    // Window Menu
    NSMenuItem *windowMenuItem = [[NSMenuItem alloc] init];
    NSMenu *windowMenu = [[NSMenu alloc] initWithTitle:@"窗口"];
    [windowMenu addItemWithTitle:@"最小化" action:@selector(performMiniaturize:) keyEquivalent:@"m"];
    [windowMenu addItemWithTitle:@"缩放" action:@selector(performZoom:) keyEquivalent:@""];
    [windowMenu addItem:[NSMenuItem separatorItem]];
    [windowMenu addItemWithTitle:@"前置全部窗口" action:@selector(arrangeInFront:) keyEquivalent:@""];
    [windowMenuItem setSubmenu:windowMenu];
    [mainMenu addItem:windowMenuItem];

    [NSApp setMainMenu:mainMenu];
}

- (void)reloadPage {
    [self.webView reload];
}

- (void)createWindow {
    if (self.window) {
        [self.window makeKeyAndOrderFront:nil];
        [NSApp activateIgnoringOtherApps:YES];
        return;
    }
    
    NSRect screenFrame = [[NSScreen mainScreen] visibleFrame];
    CGFloat w = 1340;
    CGFloat h = 880;
    if (w > screenFrame.size.width - 40) w = screenFrame.size.width - 40;
    if (h > screenFrame.size.height - 40) h = screenFrame.size.height - 40;
    
    CGFloat x = screenFrame.origin.x + (screenFrame.size.width - w) / 2.0;
    CGFloat y = screenFrame.origin.y + (screenFrame.size.height - h) / 2.0;
    
    NSWindowStyleMask style = NSWindowStyleMaskTitled |
                              NSWindowStyleMaskClosable |
                              NSWindowStyleMaskMiniaturizable |
                              NSWindowStyleMaskResizable;
    
    self.window = [[NSWindow alloc] initWithContentRect:NSMakeRect(x, y, w, h)
                                              styleMask:style
                                                backing:NSBackingStoreBuffered
                                                  defer:NO];
    self.window.title = @"FoFo 个人工作台";
    self.window.minSize = NSMakeSize(960, 640);
    self.window.collectionBehavior = NSWindowCollectionBehaviorFullScreenPrimary;
    
    WKWebViewConfiguration *config = [[WKWebViewConfiguration alloc] init];
    config.preferences.javaScriptCanOpenWindowsAutomatically = YES;
    
    self.webView = [[WKWebView alloc] initWithFrame:self.window.contentView.bounds configuration:config];
    self.webView.autoresizingMask = NSViewWidthSizable | NSViewHeightSizable;
    self.webView.navigationDelegate = self;
    self.webView.UIDelegate = self;
    
    [self.window.contentView addSubview:self.webView];
    [self.window makeKeyAndOrderFront:nil];
    [NSApp activateIgnoringOtherApps:YES];
    
    [self loadFoFo];
}

- (void)loadFoFo {
    NSURL *url = [NSURL URLWithString:@"http://localhost:3210"];
    [self.webView loadRequest:[NSURLRequest requestWithURL:url]];
}

- (void)webView:(WKWebView *)webView didFailProvisionalNavigation:(WKNavigation *)navigation withError:(NSError *)error {
    if (self.retryCount < 10) {
        self.retryCount++;
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.3 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
            [self loadFoFo];
        });
    }
}

// 外部链接点击自动跳转至系统默认浏览器 (如 Edge)，保持工作台纯净
- (void)webView:(WKWebView *)webView decidePolicyForNavigationAction:(WKNavigationAction *)navigationAction decisionHandler:(void (^)(WKNavigationActionPolicy))decisionHandler {
    NSURL *url = navigationAction.request.URL;
    NSString *host = url.host;
    if (navigationAction.navigationType == WKNavigationTypeLinkActivated) {
        if (![host isEqualToString:@"localhost"] && ![host isEqualToString:@"127.0.0.1"]) {
            [[NSWorkspace sharedWorkspace] openURL:url];
            decisionHandler(WKNavigationActionPolicyCancel);
            return;
        }
    }
    decisionHandler(WKNavigationActionPolicyAllow);
}

// 点击程序坞图标时重新显示窗口
- (BOOL)applicationShouldHandleReopen:(NSApplication *)sender hasVisibleWindows:(BOOL)flag {
    if (!flag || !self.window.isVisible) {
        [self createWindow];
    } else {
        [self.window makeKeyAndOrderFront:nil];
    }
    return YES;
}

- (BOOL)applicationShouldTerminateAfterLastWindowClosed:(NSApplication *)sender {
    return NO;
}

@end

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        NSApplication *app = [NSApplication sharedApplication];
        AppDelegate *delegate = [[AppDelegate alloc] init];
        app.delegate = delegate;
        [app setActivationPolicy:NSApplicationActivationPolicyRegular];
        [app run];
    }
    return 0;
}
EOF

clang -O2 -framework Cocoa -framework WebKit /tmp/main.m -o /tmp/FoFo_native
rm -f /tmp/main.m

echo "📦 3. 正在组装 /Applications/FoFo.app 原生软件目录..."
APP_DIR="/Applications/FoFo.app"
rm -rf "$APP_DIR"
mkdir -p "$APP_DIR/Contents/MacOS"
mkdir -p "$APP_DIR/Contents/Resources"

cp /tmp/FoFo_native "$APP_DIR/Contents/MacOS/FoFo"
chmod +x "$APP_DIR/Contents/MacOS/FoFo"
rm -f /tmp/FoFo_native

cp "$DIR/appIcon.icns" "$APP_DIR/Contents/Resources/appIcon.icns"

cat << 'EOF' > "$APP_DIR/Contents/Info.plist"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>FoFo</string>
    <key>CFBundleIconFile</key>
    <string>appIcon</string>
    <key>CFBundleIdentifier</key>
    <string>com.fofo.personal.workstation</string>
    <key>CFBundleName</key>
    <string>FoFo</string>
    <key>CFBundleDisplayName</key>
    <string>FoFo</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>2.3.2</string>
    <key>CFBundleVersion</key>
    <string>2.3.2</string>
    <key>LSMinimumSystemVersion</key>
    <string>11.0</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
EOF

printf "APPL????" > "$APP_DIR/Contents/PkgInfo"

codesign --force --deep --sign - "$APP_DIR" > /dev/null 2>&1 || true

touch "$APP_DIR"
/System/Library/Frameworks/CoreServices.framework/Versions/A/Frameworks/LaunchServices.framework/Versions/A/Support/lsregister -f "$APP_DIR"

echo "✅ 成功生成 /Applications/FoFo.app！"
echo "💡 独立进程、独立程序坞图标、纯白圆角图标底色已全部就绪！"
