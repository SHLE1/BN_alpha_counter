"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, RotateCcw, Save, ArrowUp, ArrowDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"

interface Account {
  id: string
  name: string
  transactionCount: number
  transactionAmount: number
  transactionMultiplier: number
}

export default function TransactionCounter() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [currentAccountId, setCurrentAccountId] = useState<string | null>(null)
  const [nextAccountId, setNextAccountId] = useState(0)
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [nameError, setNameError] = useState("")
  const [amountError, setAmountError] = useState("")
  const [multiplierError, setMultiplierError] = useState("")
  const { toast } = useToast()

  // Load state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("transactionCounterState")
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState)
        const loadedAccounts = parsedState.accounts && Array.isArray(parsedState.accounts) ? parsedState.accounts : []

        setAccounts(loadedAccounts)
        setCurrentAccountId(parsedState.currentAccountId || (loadedAccounts.length > 0 ? loadedAccounts[0].id : null))
        setNextAccountId(parsedState.nextAccountId || loadedAccounts.length)
      } catch (e) {
        console.error("解析 localStorage 状态时出错:", e)
        setAccounts([])
        setCurrentAccountId(null)
        setNextAccountId(0)
      }
    }
  }, [])

  // Save state to localStorage
  const saveState = (showToast = true) => {
    localStorage.setItem(
      "transactionCounterState",
      JSON.stringify({
        accounts,
        currentAccountId,
        nextAccountId,
      }),
    )
    if (showToast) {
      toast({
        title: "已保存",
        description: "您的数据已成功保存",
      })
    }
  }

  // Add a new account
  const addAccount = () => {
    const newAccountId = `account_${nextAccountId}`
    const newAccount = {
      id: newAccountId,
      name: `新账户 ${nextAccountId + 1}`,
      transactionCount: 0,
      transactionAmount: 0,
      transactionMultiplier: 1,
    }

    const updatedAccounts = [...accounts, newAccount]
    setAccounts(updatedAccounts)
    setCurrentAccountId(newAccountId)
    setNextAccountId(nextAccountId + 1)

    setTimeout(() => {
      saveState(false)
    }, 100)
  }

  // Delete account
  const deleteAccount = () => {
    if (!accountToDelete) return

    const updatedAccounts = accounts.filter((acc) => acc.id !== accountToDelete)
    setAccounts(updatedAccounts)

    if (currentAccountId === accountToDelete) {
      setCurrentAccountId(updatedAccounts.length > 0 ? updatedAccounts[0].id : null)
    }

    setIsDeleteDialogOpen(false)
    setAccountToDelete(null)

    setTimeout(() => {
      saveState(false)
      toast({
        title: "账户已删除",
        description: "账户已成功删除",
      })
    }, 100)
  }

  // Reset transaction count
  const resetCount = () => {
    if (!currentAccountId) return

    const updatedAccounts = accounts.map((acc) => {
      if (acc.id === currentAccountId) {
        return { ...acc, transactionCount: 0 }
      }
      return acc
    })

    setAccounts(updatedAccounts)

    setTimeout(() => {
      saveState(false)
      toast({
        title: "计数已归零",
        description: "交易笔数已重置为零",
      })
    }, 100)
  }

  // Update account name
  const updateAccountName = (name: string) => {
    if (!currentAccountId) return

    setNameError("")

    const updatedAccounts = accounts.map((acc) => {
      if (acc.id === currentAccountId) {
        const trimmedName = name.trim()
        const finalName =
          trimmedName === ""
            ? `账户 ${acc.id.split("_")[1] ? Number.parseInt(acc.id.split("_")[1]) + 1 : "未命名"}`
            : name

        return { ...acc, name: finalName }
      }
      return acc
    })

    setAccounts(updatedAccounts)
    saveState()
  }

  // Update transaction amount
  const updateTransactionAmount = (amount: string) => {
    if (!currentAccountId) return

    setAmountError("")
    const parsedAmount = Number.parseFloat(amount)

    if (amount.trim() === "" || isNaN(parsedAmount) || parsedAmount < 0) {
      if (amount.trim() !== "") {
        setAmountError("请输入有效的非负数字")
      }
    }

    const updatedAccounts = accounts.map((acc) => {
      if (acc.id === currentAccountId) {
        return {
          ...acc,
          transactionAmount: isNaN(parsedAmount) || parsedAmount < 0 ? 0 : parsedAmount,
        }
      }
      return acc
    })

    setAccounts(updatedAccounts)
    saveState()
  }

  // Update transaction multiplier
  const updateTransactionMultiplier = (multiplier: string) => {
    if (!currentAccountId) return

    setMultiplierError("")
    const parsedMultiplier = Number.parseFloat(multiplier)

    if (multiplier.trim() === "" || isNaN(parsedMultiplier) || parsedMultiplier <= 0) {
      if (multiplier.trim() !== "") {
        setMultiplierError("请输入有效的正数")
      }
    }

    const updatedAccounts = accounts.map((acc) => {
      if (acc.id === currentAccountId) {
        return {
          ...acc,
          transactionMultiplier: isNaN(parsedMultiplier) || parsedMultiplier <= 0 ? 1 : parsedMultiplier,
        }
      }
      return acc
    })

    setAccounts(updatedAccounts)
    saveState()
  }

  // Increment transaction count
  const incrementCount = () => {
    if (!currentAccountId) return

    const updatedAccounts = accounts.map((acc) => {
      if (acc.id === currentAccountId) {
        return { ...acc, transactionCount: acc.transactionCount + 1 }
      }
      return acc
    })

    setAccounts(updatedAccounts)
    saveState()
  }

  // Decrement transaction count
  const decrementCount = () => {
    if (!currentAccountId) return

    const updatedAccounts = accounts.map((acc) => {
      if (acc.id === currentAccountId && acc.transactionCount > 0) {
        return { ...acc, transactionCount: acc.transactionCount - 1 }
      }
      return acc
    })

    setAccounts(updatedAccounts)
    saveState()
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if modal is open or focus is in an input
      if (
        isDeleteDialogOpen ||
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return
      }

      if (event.key === "ArrowUp") {
        event.preventDefault()
        incrementCount()
      } else if (event.key === "ArrowDown") {
        event.preventDefault()
        decrementCount()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentAccountId, accounts, isDeleteDialogOpen])

  // Get current account data
  const currentAccount = accounts.find((acc) => acc.id === currentAccountId)

  // Calculate total transaction value
  const totalTransactionValue = currentAccount
    ? currentAccount.transactionCount * currentAccount.transactionAmount * currentAccount.transactionMultiplier
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4 flex flex-col items-center justify-center">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader className="text-center border-b pb-6">
          <CardTitle className="text-3xl font-bold text-gray-800 dark:text-gray-100">币安 Alpha 交易额计数器</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {accounts.length > 0 ? (
            <Tabs value={currentAccountId || ""} onValueChange={setCurrentAccountId} className="w-full">
              <div className="flex items-center justify-between mb-6">
                <TabsList className="grid grid-flow-col auto-cols-max gap-2 overflow-x-auto max-w-[calc(100%-110px)] p-1">
                  {accounts.map((account) => (
                    <TabsTrigger key={account.id} value={account.id} className="px-4 py-2 whitespace-nowrap">
                      {account.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <Button onClick={addAccount} size="sm" className="ml-2 bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4 mr-1" />
                  添加新账户
                </Button>
              </div>

              {accounts.map((account) => (
                <TabsContent key={account.id} value={account.id} className="mt-0">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={account.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="account-name" className="text-sm font-medium">
                              账户名称
                            </Label>
                            <Input
                              id="account-name"
                              value={account.name}
                              onChange={(e) => updateAccountName(e.target.value)}
                              className={nameError ? "border-red-500" : ""}
                            />
                            {nameError && <p className="text-sm text-red-500">{nameError}</p>}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="transaction-amount" className="text-sm font-medium">
                              每次交易数量
                            </Label>
                            <Input
                              id="transaction-amount"
                              type="number"
                              min="0"
                              step="any"
                              value={account.transactionAmount}
                              onChange={(e) => updateTransactionAmount(e.target.value)}
                              className={amountError ? "border-red-500" : ""}
                            />
                            {amountError && <p className="text-sm text-red-500">{amountError}</p>}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="transaction-multiplier" className="text-sm font-medium">
                            交易额倍数
                          </Label>
                          <Input
                            id="transaction-multiplier"
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={account.transactionMultiplier}
                            onChange={(e) => updateTransactionMultiplier(e.target.value)}
                            className={multiplierError ? "border-red-500" : ""}
                          />
                          {multiplierError && <p className="text-sm text-red-500">{multiplierError}</p>}
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500 dark:text-gray-400 font-medium">交易笔数:</span>
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={decrementCount}
                                disabled={account.transactionCount <= 0}
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100 min-w-[3ch] text-center">
                                {account.transactionCount}
                              </span>
                              <Button variant="outline" size="icon" onClick={incrementCount}>
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-gray-500 dark:text-gray-400 font-medium">总交易额:</span>
                            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                              {totalTransactionValue.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 mt-6">
                          <Button
                            variant="destructive"
                            className="sm:flex-1"
                            onClick={() => {
                              setAccountToDelete(account.id)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            删除账户
                          </Button>
                          <Button variant="outline" className="sm:flex-1" onClick={resetCount}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            计数归零
                          </Button>
                          <Button
                            className="sm:flex-1 bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => saveState(true)}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            保存数据
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="text-center py-12 space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">没有账户</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                看起来您还没有添加任何交易账户。点击下方按钮开始吧！
              </p>
              <Button onClick={addAccount} className="mt-2 bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                添加新账户
              </Button>
            </div>
          )}

          {accounts.length > 0 && (
            <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
              <p>
                按{" "}
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 font-mono text-xs">
                  ↑
                </kbd>{" "}
                键增加交易笔数， 按{" "}
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 font-mono text-xs">
                  ↓
                </kbd>{" "}
                键减少交易笔数
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        作者:{" "}
        <a
          href="https://x.com/0xM3tr0"
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-600 hover:underline"
        >
          X: @0xM3tr0
        </a>
      </p>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除账户 "{accounts.find((acc) => acc.id === accountToDelete)?.name}" 吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={deleteAccount} className="bg-red-600 hover:bg-red-700">
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
