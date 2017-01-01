#import "ViewController.h"
#import "ASScreenRecorder.h"

NSString* const tenomeUrl = @"tenomeUrl";
NSString* const defaultUrl = @"http://192.168.1.6:8080/test.html";

@implementation ViewController

@synthesize webView;
@synthesize recordButton;
@synthesize refreshButton;

- (void) viewDidLoad {
    [super viewDidLoad];
    
    _ready = NO;
    _device = nil;
    
    [self.webView.scrollView setScrollEnabled:NO];
   
    // setup js bridge
    self.bridge = [WebViewJavascriptBridge bridgeForWebView:webView];
    //[WebViewJavascriptBridge enableLogging];
   
    [self.bridge setWebViewDelegate:self];
    [self.bridge registerHandler:@"ready" handler:^(id data, WVJBResponseCallback responseCallback) {
        NSLog(@"webview is ready");
        _ready = YES;
        responseCallback(data);
    }];
    
    [self.bridge registerHandler:@"vibrate" handler:^(id data, WVJBResponseCallback responseCallback) {
        if (_device) {
            NSDictionary* values = data;
            NSNumber* s = [values valueForKey:@"strength"];
            [_device setVibration:[s intValue] onComplete:^(BOOL ok, NSError* err) {
                responseCallback(data);
            }];
        }
    }];
    
    // Set up two tap to stop recording
    UITapGestureRecognizer *tapGesture = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(onDoubleTap:)];
    tapGesture.numberOfTapsRequired = 2;
    tapGesture.delegate = self;
    [self.webView addGestureRecognizer:tapGesture];
    
    // Set up bluetooth
    _manager = [[CBCentralManager alloc] initWithDelegate:self queue:nil options:nil];
}


- (void) centralManagerDidUpdateState:(CBCentralManager *)central {
    switch (central.state) {
        case CBCentralManagerStatePoweredOff:
            NSLog(@"CoreBluetooth BLE hardware is powered off");
            break;
        case CBCentralManagerStatePoweredOn:
            [_manager scanForPeripheralsWithServices:nil options:nil];
            break;
        default:
            break;
    }
}

- (void)centralManager:(CBCentralManager *)central
 didDiscoverPeripheral:(CBPeripheral *)peripheral
     advertisementData:(NSDictionary *)advertisementData
                  RSSI:(NSNumber *)RSSI
{
    NSLog(@"Discovered %@", peripheral.name);
    const NSUUID* hushUuid = [[NSUUID alloc] initWithUUIDString:@"FB7E00D6-7C6A-480F-B4C7-CABC1973AE6E"];
    const NSUUID* lushUuid = [[NSUUID alloc] initWithUUIDString:@"90635C08-1AF8-42A2-9477-E3F2A1E54DA7"];
    
    if ([peripheral.identifier isEqual:hushUuid]) {
        [_manager stopScan];
        _peripheral = peripheral;
        [_manager connectPeripheral:peripheral options:nil];
    }
}

- (void)centralManager:(CBCentralManager *)central didConnectPeripheral:(CBPeripheral *)peripheral {
    [LovenseVibratorController createWithPeripheral:peripheral onReady:^(LovenseVibratorController* device) {
        _device = device;
        [device getBattery:^(NSNumber* result, NSError* err) {
            NSLog(@"Battery: %@", result);
        }];
        
        
        [device getDeviceType:^(NSString* result, NSError* err) {
            NSLog(@"Type: %@", result);
        }];
 
    }];
}

- (void) viewDidAppear:(BOOL)animated {
    UIAlertController *alert = [UIAlertController alertControllerWithTitle:@"Viewer Url"
                                                                   message:nil
                                                            preferredStyle:UIAlertControllerStyleAlert];
    
    [alert addAction:[UIAlertAction actionWithTitle:@"Done" style:UIAlertActionStyleDefault handler:^(UIAlertAction* action) {
        NSString* path = alert.textFields[0].text;
        
        [[NSUserDefaults standardUserDefaults] setObject:path forKey:tenomeUrl];
        [[NSUserDefaults standardUserDefaults] synchronize];
        
        [webView loadRequest:[NSURLRequest requestWithURL: [NSURL URLWithString:path]]];
    }]];
    
    [alert addTextFieldWithConfigurationHandler:^(UITextField *textField) {
        NSString* url = [[NSUserDefaults standardUserDefaults] stringForKey:tenomeUrl];
        if (url == NULL) {
            url = defaultUrl;
        }
        textField.text = url;
    }];
    [self presentViewController:alert animated:YES completion:nil];
}

- (IBAction) refresh:(id)sender {
    [webView reload];
}

- (IBAction) hitRecordButton:(id)sender {
    ASScreenRecorder *recorder = [ASScreenRecorder sharedInstance];
    if (!recorder.isRecording) {
        refreshButton.hidden = YES;
        recordButton.hidden = YES;
        [recorder startRecording];
    }
}

- (BOOL) gestureRecognizer:(UIGestureRecognizer*)gestureRecognizer shouldRecognizeSimultaneouslyWithGestureRecognizer:(UIGestureRecognizer*)otherGestureRecognizer {
    return YES;
}

- (void) onDoubleTap:(UIGestureRecognizer*)recognizer {
    ASScreenRecorder *recorder = [ASScreenRecorder sharedInstance];
    if (!recorder.isRecording) {
        return;
    }
    
    [recorder stopRecordingWithCompletion:^{
        refreshButton.hidden = NO;
        recordButton.hidden = NO;
    }];
}


- (void) webViewDidStartLoad:(UIWebView *)webView {
    _ready = NO;
}

@end
