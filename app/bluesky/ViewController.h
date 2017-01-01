#import <UIKit/UIKit.h>
@import CoreBluetooth;
#import "LovenseController.h"
#import "WebViewJavascriptBridge.h"

@interface ViewController : UIViewController <
    UIWebViewDelegate,
    UIGestureRecognizerDelegate,
    CBCentralManagerDelegate>
{
    BOOL _ready;
    NSURL* _path;
    CBCentralManager* _manager;
    LovenseVibratorController* _device;
    CBPeripheral* _peripheral;
}

@property (nonatomic, weak) IBOutlet UIWebView* webView;
@property (nonatomic, weak) IBOutlet UIButton* refreshButton;
@property (nonatomic, weak) IBOutlet UIButton* recordButton;

@property WebViewJavascriptBridge* bridge;


- (IBAction) refresh:(id)sender;

- (IBAction) hitRecordButton:(id)sender;


@end

