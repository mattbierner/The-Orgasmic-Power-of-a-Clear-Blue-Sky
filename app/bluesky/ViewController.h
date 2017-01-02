#import <UIKit/UIKit.h>
@import CoreBluetooth;
#import "LovenseController.h"
#import "WebViewJavascriptBridge.h"

@interface ViewController : UIViewController <
    UIWebViewDelegate,
    UIGestureRecognizerDelegate,
    CBCentralManagerDelegate>
{
    NSURL* _path;
    CBCentralManager* _manager;
    CBPeripheral* _peripheral;
    LovenseVibratorController* _device;
}

@property (nonatomic, weak) IBOutlet UIWebView* webView;
@property (nonatomic, weak) IBOutlet UIButton* refreshButton;
@property (nonatomic, weak) IBOutlet UIButton* recordButton;

@property WebViewJavascriptBridge* bridge;

- (IBAction) refresh:(id)sender;
- (IBAction) hitRecordButton:(id)sender;

@end
