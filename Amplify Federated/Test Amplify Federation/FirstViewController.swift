//
//  FirstViewController.swift
//  Test Amplify Federation
//
//  Created by Stormacq, Sebastien on 04/08/2019.
//  Copyright © 2019 Stormacq, Sebastien. All rights reserved.
//

import UIKit
import AWSMobileClient

class FirstViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        let signinButton = UIButton(frame: CGRect(x: 100, y: 100, width: 100, height: 50))
        signinButton.backgroundColor = .blue
        signinButton.setTitle("SignIn", for: .normal)
        signinButton.addTarget(self, action: #selector(signinButtonAction), for: .touchUpInside)
        let signoutButton = UIButton(frame: CGRect(x: 100, y: 200, width: 100, height: 50))
        signoutButton.backgroundColor = .blue
        signoutButton.setTitle("SignOut", for: .normal)
        signoutButton.addTarget(self, action: #selector(signoutButtonAction), for: .touchUpInside)
        
        self.view.addSubview(signinButton)
        self.view.addSubview(signoutButton)
    }
    
    @objc func signinButtonAction(sender: UIButton!) {
        print("SignInButton tapped")
//        AWSMobileClient.sharedInstance().showSignIn(navigationController: self.navigationController!, { (signInState, error) in
//            if let signInState = signInState {
//                print("Sign in flow completed: \(signInState)")
//            } else if let error = error {
//                print("error logging in: \(error.localizedDescription)")
//            }
//        })
        
        // Optionally override the scopes based on the usecase.
        let hostedUIOptions = HostedUIOptions(scopes: ["openid", "email", "profile", "aws.cognito.signin.user.admin"])
        
        // Present the Hosted UI sign in.
        AWSMobileClient.sharedInstance().showSignIn(navigationController: self.navigationController!, hostedUIOptions: hostedUIOptions) { (userState, error) in
            if let error = error as? AWSMobileClientError {
                print(error.localizedDescription)
            }
            if let userState = userState {
                print("Status: \(userState.rawValue)")
                print("\(AWSMobileClient.sharedInstance().username)")
                print("")
                AWSMobileClient.sharedInstance().getTokens({ (tokens, error) in
                    print("\(error)")
                    print("\(tokens)")
                })
                print("")
                AWSMobileClient.sharedInstance().getUserAttributes(completionHandler: { (attributes, error) in
                    print("\(error)")
                    print("\(attributes)")
                })
                
            }
        }

    }
    
    @objc func signoutButtonAction(sender: UIButton!) {
        print("SignoutButton tapped")
        AWSMobileClient.sharedInstance().signOut()
    }
}

