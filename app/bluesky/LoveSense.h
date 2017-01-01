#import <Foundation/Foundation.h>
@import CoreBluetooth;

@interface LoveSenseBase : NSObject <CBPeripheralDelegate>
{
    CBPeripheral* _peripheral;
    CBCharacteristic* _characteristic;
    void(^_onReady)(LoveSenseBase*);
}

- (id) initWithPeripheral:(CBPeripheral*)peripheral onReady:(void(^)(LoveSenseBase*))ready;

- (void) setVibration:(int)level;

@end
