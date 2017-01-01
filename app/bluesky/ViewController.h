#import <UIKit/UIKit.h>
@import CoreBluetooth;
#import "LoveSense.h"

@interface ViewController : UIViewController <
    UIGestureRecognizerDelegate,
    CBCentralManagerDelegate>
{
    NSURL* _path;
    CBCentralManager* _manager;
    LoveSense* _device;
        CBPeripheral* _peripheral;

}

@property (nonatomic, weak) IBOutlet UIWebView* webView;
@property (nonatomic, weak) IBOutlet UIButton* refreshButton;
@property (nonatomic, weak) IBOutlet UIButton* recordButton;

- (IBAction) refresh:(id)sender;

- (IBAction) hitRecordButton:(id)sender;


@end

