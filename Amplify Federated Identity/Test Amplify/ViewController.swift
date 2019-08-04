//
//  ViewController.swift
//  Test Amplify
//
//  Created by Stormacq, Sebastien on 04/08/2019.
//  Copyright © 2019 Stormacq, Sebastien. All rights reserved.
//

import UIKit
import GoogleSignIn

class ViewController: UIViewController, GIDSignInUIDelegate {

    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view.
        GIDSignIn.sharedInstance().uiDelegate = self
        
        let button = GIDSignInButton(frame: CGRect(x: 100, y: 100, width: 100, height: 50))
//        button.addTarget(self, action: #selector(buttonAction), for: .touchUpInside)
        
        self.view.addSubview(button)
    }

//    @objc func buttonAction(sender: UIButton!) {
//        print("Button tapped")
//    }
}

