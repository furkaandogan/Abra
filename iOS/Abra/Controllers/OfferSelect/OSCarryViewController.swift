//
//  OfferViewController.swift
//  Abra
//
//  Created by Hakan Eren on 17/02/2018.
//  Copyright © 2018 Hakan Eren. All rights reserved.
//

import UIKit

class OSCarryViewController: OSBaseViewController {
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        startOS(mode: .carry) { [unowned self] in
            self.tabBarController?.selectedIndex = 1
        }
    }

}
