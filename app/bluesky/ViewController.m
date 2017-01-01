#import "ViewController.h"
#import "ASScreenRecorder.h"
#import "LoveSense.h"

NSString* const tenomeUrl = @"tenomeUrl";
NSString* const defaultUrl = @"http://192.168.1.6:8080/test.html";

@implementation ViewController

@synthesize webView;
@synthesize recordButton;
@synthesize refreshButton;



- (void) viewDidLoad {
    [super viewDidLoad];
    
    [webView.scrollView setScrollEnabled:NO];
    
    UITapGestureRecognizer *tapGesture = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(onDoubleTap:)];
    tapGesture.numberOfTapsRequired = 2;
    tapGesture.delegate = self;
    
    [self.webView addGestureRecognizer:tapGesture];
    
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
    
    if ([peripheral.identifier isEqual:hushUuid]) {
        [_manager stopScan];
        _peripheral = peripheral;
        [_manager connectPeripheral:peripheral options:nil];
    }
}

- (void)centralManager:(CBCentralManager *)central
  didConnectPeripheral:(CBPeripheral *)peripheral {
    _device = [[LoveSense alloc] initWithPeripheral:peripheral onReady:^(LoveSense* device){
        [device setVibration:1];
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


@end
